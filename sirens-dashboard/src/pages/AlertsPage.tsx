import { useState } from 'react'
import { callable } from '@/firebase/firebaseConfig'
import { useAlerts, usePolls } from '@/hooks/userFirestore'
import { useToast } from '@/context/ToastContext'
import { Panel, Btn, EmptyState } from '@/components/ui/UI'

export default function AlertsPage() {
  const alerts = useAlerts()
  const polls = usePolls()
  const { showToast } = useToast()
  const [dismissing, setDismissing] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    message: '',
    city: 'Karachi',
    severity: 'medium' as 'low' | 'medium' | 'high'
  })
  const [loading, setLoading] = useState(false)

  async function publishAlert() {
    if (!form.title || !form.message) {
      showToast('Missing Info', 'Please provide both title and message.', 'warning')
      return
    }

    setLoading(true)
    try {
      await callable.sendOfficialAlert(form)
      showToast('Alert Published 📢', 'Official alert has been broadcasted.', 'success')
      setForm({ title: '', message: '', city: 'Karachi', severity: 'medium' })
    } catch (e: any) {
      showToast('Error', e.message ?? 'Failed to publish alert', 'danger')
    } finally {
      setLoading(false)
    }
  }

  async function dismissAlert(alertId: string) {
    setDismissing(alertId)
    try {
      await callable.dismissAlert({ alertId })
      showToast('Alert Dismissed', 'Alert has been removed.', 'success')
    } catch (e: any) {
      showToast('Error', e.message ?? 'Failed to dismiss alert', 'danger')
    } finally {
      setDismissing(null)
    }
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Alert Publisher</div>
        <div className="page-subtitle">BROADCAST OFFICIAL NOTIFICATIONS TO CITIZENS</div>
      </div>

      <div className="grid-40-60" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px' }}>
        <Panel title="New Alert" icon="📢">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>ALERT TITLE</label>
              <input
                className="btn-ghost"
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '4px' }}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Flash Flood Warning"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>MESSAGE</label>
              <textarea
                className="btn-ghost"
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '4px', minHeight: '100px' }}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Details about the emergency and instructions..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>CITY</label>
                <input
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '4px' }}
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>SEVERITY</label>
                <select
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '4px' }}
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: e.target.value as any })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <Btn variant="success" loading={loading} onClick={publishAlert} style={{ marginTop: '8px' }}>
              Publish Official Alert
            </Btn>
          </div>
        </Panel>

        <Panel title="Recent Alerts" icon="📡">
          {alerts.length === 0 && <EmptyState icon="📡" msg="No active alerts found" />}
          <div className="feed-list">
            {alerts.map(a => {
              const poll = a.pollId ? polls.find(p => p.id === a.pollId) : null
              const totalVotes = poll ? poll.yesVotes + poll.noVotes : 0
              const yesPercent = totalVotes > 0 ? Math.round((poll!.yesVotes / totalVotes) * 100) : 0
              return (
                <div key={a.id} className="feed-item">
                  <div className="feed-dot" style={{ background: a.severity === 'high' ? 'var(--red-hot)' : a.severity === 'medium' ? 'var(--orange)' : 'var(--green-ok)' }} />
                  <div className="feed-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="feed-title">{a.title}</div>
                      <button
                        onClick={() => dismissAlert(a.id)}
                        disabled={dismissing === a.id}
                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--dim)', borderRadius: 4, padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer', marginLeft: 8 }}
                        title="Dismiss alert"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="feed-msg">{a.message}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      <span>📍 {a.city ?? 'Area unknown'}</span>
                      <span>🕒 {a.timestamp?.toDate().toLocaleTimeString() ?? '—'}</span>
                    </div>
                    {poll && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          📊 {poll.question}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                          <span style={{ color: 'var(--green-ok)' }}>👍 Yes: {poll.yesVotes}</span>
                          <span style={{ color: 'var(--red-hot)' }}>👎 No: {poll.noVotes}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>Total: {totalVotes}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Yes: {yesPercent}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </div>
  )
}
