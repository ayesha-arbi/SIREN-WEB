import { useState } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'
import { useSOSSignals } from '@/hooks/userFirestore'
import { Panel, Btn, Spinner, EmptyState } from '@/components/ui/UI'
import { useToast } from '@/context/ToastContext'

export default function SOSPage() {
  const { signals, loading, refresh } = useSOSSignals()
  const { showToast } = useToast()
  const [dispatchingId, setDispatchingId] = useState<string | null>(null)

  async function dispatchSignal(id: string) {
    setDispatchingId(id)
    try {
      const signalRef = doc(db, 'sos_signals', id)
      await updateDoc(signalRef, { status: 'dispatched' })
      showToast('SOS Dispatched ✅', 'Emergency services have been notified.', 'success')
    } catch (e: any) {
      showToast('Error', e.message ?? 'Failed to dispatch signal', 'danger')
    } finally {
      setDispatchingId(null)
      refresh()
    }
  }

  const pending = signals.filter(s => s.status === 'pending')

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">SOS Signal Monitor</div>
        <div className="page-subtitle">LIVE EMERGENCY REQUESTS — PENDING DISPATCH</div>
      </div>

      <Panel title="Pending SOS Signals" icon="🆘">
        {loading && <Spinner />}
        {!loading && pending.length === 0 && <EmptyState icon="✅" msg="No pending SOS signals" />}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map(s => (
            <div key={s.id} className="eval-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>User ID: {s.userId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    📍 {s.location.latitude.toFixed(4)}, {s.location.longitude.toFixed(4)}
                  </div>
                  {s.message && <div style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--text-main)' }}>"{s.message}"</div>}
                </div>
                <Btn
                  variant="success"
                  size="sm"
                  loading={dispatchingId === s.id}
                  onClick={() => dispatchSignal(s.id)}
                >
                  Dispatch Now
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
