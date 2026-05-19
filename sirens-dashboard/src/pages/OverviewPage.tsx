import { useState } from 'react'
import { callable } from '@/firebase/firebaseConfig'
import { useCrises, useDangerZones, useSOSSignals, useAlerts, useResolvedCount } from '@/hooks/userFirestore'
import { Panel, StatCard, SeverityBadge, ConfidenceBar, Btn, LivePill, MapCanvas, ResolveModal, Spinner, EmptyState } from '@/components/ui/UI'
import { useToast } from '@/context/ToastContext'
import type { Page } from '@/types'
import { Marker, Circle } from '@react-google-maps/api'

interface Props { onNavigate: (p: Page) => void }

export default function OverviewPage({ onNavigate }: Props) {
  const { crises, loading: loadingCrises } = useCrises()
  const zones = useDangerZones()
  const { signals } = useSOSSignals()
  const alerts = useAlerts()
  const resolvedCount = useResolvedCount()
  const { showToast } = useToast()

  const [resolveId, setResolveId]     = useState<string | null>(null)
  const [resolveName, setResolveName] = useState('')
  const [resolving, setResolving]     = useState(false)

  async function confirmResolve() {
    if (!resolveId) return
    setResolving(true)
    try {
      await callable.triggerImpactEvaluation({ crisisId: resolveId })
      showToast('Agent 5 Running ✅', `Impact evaluation started for ${resolveId}.`, 'success')
    } catch (e: any) {
      showToast('Error', e.message ?? 'Failed to trigger Agent 5', 'danger')
    } finally {
      setResolving(false)
      setResolveId(null)
    }
  }

  const pendingSOS = signals.filter(s => s.status === 'pending')

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">Command Overview</div>
          <div className="page-subtitle">REAL-TIME SITUATIONAL AWARENESS — KARACHI DISTRICT</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <StatCard label="Active Crises"     value={crises.length}      change="Live from Firestore"   color="red"    icon="⚠" />
        <StatCard label="SOS Signals"       value={pendingSOS.length}  change="Pending dispatch"      color="orange" icon="🆘" />
        <StatCard label="Danger Zones"      value={zones.length}       change="Active on map"         color="blue"   icon="🗺" />
        <StatCard label="Resolved Today"    value={resolvedCount}      change="Agent 5 completions"   color="green"  icon="✓" />
      </div>

      {/* Map + alerts feed */}
      <div className="grid-65-35" style={{ marginBottom: 20 }}>
        <Panel title="Live Situational Map" icon="◈" actions={<LivePill />} noPad>
          <MapCanvas height={380}>
            {/* Danger zones as red circles */}
            {zones.map((z) => (
              <Circle
                key={z.id}
                center={{ lat: z.center.latitude, lng: z.center.longitude }}
                radius={z.radiusKm * 1000}
                options={{
                  fillColor: 'rgba(255, 45, 85, 0.5)',
                  strokeColor: 'rgba(255, 45, 85, 1)',
                  strokeOpacity: 0.8,
                  fillOpacity: 0.4,
                }}
              />
            ))}
            {/* SOS markers */}
            {pendingSOS.map((s) => (
              <Marker
                key={s.id}
                position={{ lat: s.location.latitude, lng: s.location.longitude }}
              />
            ))}
            <div className="map-info">
              <div className="map-info-title">🗺 DANGER ZONES</div>
              {zones.slice(0, 3).map(z => (
                <div key={z.id} className="map-info-row">
                  <span>{z.crisisId ?? z.id.slice(0, 8)}</span>
                  <span className="map-info-val">{z.radiusKm} km</span>
                </div>
              ))}
              {zones.length === 0 && <div style={{ color: 'var(--green-ok)', fontSize: '0.65rem' }}>No active zones</div>}
            </div>
            <div className="map-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: 'rgba(255,45,85,0.6)' }} /> Danger Zone</div>
              <div className="legend-item"><div className="legend-line" style={{ background: 'rgba(0,230,118,0.6)' }} /> Alt Route</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--red-hot)' }} /> SOS Signal</div>
            </div>
          </MapCanvas>
        </Panel>

        <Panel title="Live Alerts Feed" icon="📡" actions={<span className="badge badge-active">STREAMING</span>} noPad>
          <div className="feed-list">
            {alerts.length === 0 && <EmptyState icon="📡" msg="No active alerts" />}
            {alerts.slice(0, 7).map(a => (
              <div key={a.id} className="feed-item">
                <div className="feed-dot" style={{ background: a.severity === 'high' ? 'var(--red-hot)' : a.severity === 'medium' ? 'var(--orange)' : 'var(--green-ok)' }} />
                <div className="feed-content">
                  <div className="feed-title">{a.title}</div>
                  <div className="feed-msg">{a.message}</div>
                  <div className="feed-time">{a.timestamp?.toDate().toLocaleTimeString() ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Crisis snapshot + agent eval */}
      <div className="grid-40-60">
        <Panel title="Active Crises" icon="⚠" actions={<button className="btn btn-ghost btn-xs" onClick={() => onNavigate('crises')}>View All →</button>}>
          {loadingCrises && <Spinner />}
          {!loadingCrises && crises.length === 0 && <EmptyState icon="✅" msg="No active crises" />}
          <div className="crisis-list">
            {crises.slice(0, 3).map(c => (
              <div key={c.id} className={`crisis-card ${c.severity}`}>
                <div className="crisis-icon-wrap">
                  {c.crisisType?.toLowerCase().includes('flood') ? '🌊' : c.crisisType?.toLowerCase().includes('fire') ? '🔥' : '⚠️'}
                </div>
                <div className="crisis-info">
                  <div className="crisis-title">{c.crisisType} — {c.areaName ?? 'Unknown'}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <SeverityBadge severity={c.severity} />
                  </div>
                  <ConfidenceBar score={c.credibilityScore} severity={c.severity} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Agent 5 — Impact Evaluation" icon="🎯">
          <div style={{ marginBottom: 14, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Select an active crisis and run Agent 5 to evaluate impact, clear map zones, free resources and notify citizens.
          </div>
          {crises.length === 0 && <EmptyState icon="✅" msg="No active crises to resolve" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {crises.map(c => (
              <div key={c.id} className="eval-card">
                <div className="eval-icon">
                  {c.crisisType?.toLowerCase().includes('flood') ? '🌊' : c.crisisType?.toLowerCase().includes('fire') ? '🔥' : '⚠️'}
                </div>
                <div>
                  <div className="eval-title">{c.crisisType} — {c.areaName}</div>
                  <div className="eval-desc">Confidence: {Math.round(c.credibilityScore * 100)}%</div>
                </div>
                <Btn variant="success" size="sm" style={{ marginLeft: 'auto' }}
                  onClick={() => { setResolveId(c.id); setResolveName(`${c.crisisType} — ${c.areaName}`) }}>
                  ▶ Run Agent 5
                </Btn>
              </div>
            ))}
          </div>
        </Panel>
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