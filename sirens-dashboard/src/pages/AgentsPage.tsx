import { useAgentTraces } from '@/hooks/userFirestore'
import { Panel, StatCard } from '@/components/ui/UI'

export default function AgentsPage() {
  const traces = useAgentTraces()

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">AI Agent Fleet</div>
        <div className="page-subtitle">MONITORING AUTONOMOUS RESPONSE AGENTS</div>
      </div>

      <div className="stats-row">
        <StatCard label="Active Agents" value="5" change="All systems operational" color="blue" icon="🤖" />
        <StatCard label="Total Decisions" value={traces.length} change="Real-time processing" color="green" icon="✓" />
      </div>

      <Panel title="Agent Status" icon="⚙">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { id: 'Agent 1', role: 'Detection & Validation', status: 'Active', load: 'Low' },
            { id: 'Agent 2', role: 'Resource Allocation', status: 'Active', load: 'Medium' },
            { id: 'Agent 3', role: 'Citizen Notification', status: 'Active', load: 'Low' },
            { id: 'Agent 4', role: 'Danger Zone Mapping', status: 'Active', load: 'Medium' },
            { id: 'Agent 5', role: 'Impact Evaluation', status: 'Active', load: 'High' },
          ].map(agent => (
            <div key={agent.id} className="eval-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{agent.id}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{agent.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--green-ok)' }}>{agent.status}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Load: {agent.load}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
