import { useState } from 'react'
import { callable } from '@/firebase/firebaseConfig'
import { useCrises } from '@/hooks/userFirestore'
import { Panel, SeverityBadge, ConfidenceBar, Btn, Spinner, EmptyState, ResolveModal } from '@/components/ui/UI'
import { useToast } from '@/context/ToastContext'

export default function CrisesPage() {
  const { crises, loading } = useCrises()
  const { showToast } = useToast()
  const [resolveId, setResolveId]     = useState<string | null>(null)
  const [resolveName, setResolveName] = useState('')
  const [resolving, setResolving]     = useState(false)
  const [filter, setFilter]           = useState<'all' | 'high' | 'medium' | 'low'>('all')

  async function confirmResolve() {
    if (!resolveId) return
    setResolving(true)
    try {
      await callable.triggerImpactEvaluation({ crisisId: resolveId })
      showToast('Agent 5 Triggered ✅', `Evaluating & resolving crisis ${resolveId}.`, 'success')
    } catch (e: any) {
      showToast('Error', e.message ?? 'Failed', 'danger')
    } finally {
      setResolving(false)
      setResolveId(null)
    }
  }

  const icons: Record<string, string> = { flood: '🌊', fire: '🔥', accident: '🚗', medical: '🏥', infrastructure: '🏗️' }
  const getIcon = (type: string) => {
    const key = Object.keys(icons).find(k => type.toLowerCase().includes(k))
    return key ? icons[key] : '⚠️'
  }

  const filtered = filter === 'all' ? crises : crises.filter(c => c.severity === filter)

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Crisis Monitor</div>
          <div className="page-subtitle">AI-DETECTED INCIDENTS — LIVE FROM FIRESTORE</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all','high','medium','low'] as const).map(f => (
            <button key={f} className={`btn btn-ghost btn-sm${filter === f ? ' active-filter' : ''}`}
              style={filter === f ? { borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' } : {}}
              onClick={() => setFilter(f)}>{f.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && filtered.length === 0 && <EmptyState icon="✅" msg="No active crises matching filter" />}

      <div className="crisis-list">
        {filtered.map(c => (
          <div key={c.id} className={`crisis-card ${c.severity}`}>
            <div className="crisis-icon-wrap">{getIcon(c.crisisType)}</div>
            <div className="crisis-info" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div className="crisis-title">{c.crisisType} — {c.areaName ?? 'Unknown Area'}</div>
                <SeverityBadge severity={c.severity} />
                <span className="badge badge-active">ACTIVE</span>
              </div>
              <div className="crisis-meta">
                📍 {c.areaName?.toUpperCase() ?? 'UNKNOWN'} &nbsp;·&nbsp;
                ID: {c.id.slice(0, 12).toUpperCase()}
              </div>

              {/* AI Insights block */}
              <div className="crisis-explanation">
                <div className="crisis-explanation-label">🤖 AI INSIGHTS</div>
                {c.explanation || 'No explanation provided by AI agent.'}
              </div>

              <ConfidenceBar score={c.credibilityScore} severity={c.severity} />
              <div className="confidence-label" style={{ marginTop: 3 }}>
                Confidence: {Math.round(c.credibilityScore * 100)}%
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <Btn variant="success" size="sm"
                onClick={() => { setResolveId(c.id); setResolveName(`${c.crisisType} — ${c.areaName}`) }}>
                ✓ Evaluate &amp; Resolve
              </Btn>
              <Btn variant="ghost" size="sm">📍 View on Map</Btn>
            </div>
          </div>
        ))}
      </div>

      <ResolveModal
        crisisId={resolveId}
        crisisName={resolveName}
        onClose={() => setResolveId(null)}
        onConfirm={confirmResolve}
        loading={resolving}
      />
    </div>
  )
}