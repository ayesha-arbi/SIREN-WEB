import { useReports } from '@/hooks/userFirestore'
import { Panel, SeverityBadge, Spinner, EmptyState } from '@/components/ui/UI'

export default function IncidentsPage() {
  const { reports, loading } = useReports()

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Incident Archive</div>
        <div className="page-subtitle">ALL HISTORICAL REPORTS & CITIZEN SUBMISSIONS</div>
      </div>

      <Panel title="Incident Log" icon="📋">
        {loading && <Spinner />}
        {!loading && reports.length === 0 && <EmptyState icon="📋" msg="No incidents reported" />}
        <div className="feed-list">
          {reports.map(r => (
            <div key={r.id} className="feed-item">
              <div className="feed-dot" style={{ background: r.status === 'active' ? 'var(--red-hot)' : 'var(--green-ok)' }} />
              <div className="feed-content">
                <div className="feed-title">{r.category} — {r.areaName}</div>
                <div className="feed-msg">{r.description}</div>
                <div className="feed-time">{r.timestamp?.toDate().toLocaleTimeString() ?? '—'}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  User: {r.userId} · Status: {r.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
