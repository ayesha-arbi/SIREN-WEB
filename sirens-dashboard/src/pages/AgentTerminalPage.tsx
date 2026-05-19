import { useAgentTraces } from '@/hooks/userFirestore'
import { Panel, Spinner, EmptyState, Btn } from '@/components/ui/UI'

export default function AgentTerminalPage() {
  const traces = useAgentTraces()

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">AI Agent Terminal</div>
        <div className="page-subtitle">LIVE REASONING LOGS FROM THE AGENT FLEET</div>
      </div>

      <Panel title="Reasoning Stream" icon="⌨" actions={<Btn variant="ghost" size="xs">Clear Logs</Btn>}>
        <div className="terminal-container" style={{
          background: '#02050f',
          fontFamily: 'var(--font-mono)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          minHeight: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          lineHeight: '1.6',
          fontSize: '0.85rem',
          color: '#a0aebf'
        }}>
          {traces.length === 0 && <EmptyState icon="🤖" msg="No agent traces available" />}
          {traces.map((t, i) => (
            <div key={t.id} style={{ marginBottom: '20px', borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '12px' }}>
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '4px' }}>
                [{t.timestamp?.toDate().toLocaleTimeString() ?? 'NOW'}] AGENT: {t.agent}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', color: '#d1d5db' }}>
                {t.rawReasoning}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
