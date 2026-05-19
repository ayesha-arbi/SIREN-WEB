import type { Page } from '@/types'

interface Props {
  current: Page
  onNavigate: (p: Page) => void
  crisisCount: number
  sosCount: number
}

const sections = [
  {
    label: 'Main',
    items: [
      { id: 'overview' as Page, icon: '⬡', label: 'Overview' },
      { id: 'map'      as Page, icon: '◈', label: 'Live Map' },
      { id: 'crises'   as Page, icon: '⚠', label: 'Crisis Monitor', badge: 'crisisCount' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 'sos'       as Page, icon: '🆘', label: 'SOS Monitor', badge: 'sosCount' },
      { id: 'alerts'    as Page, icon: '📢', label: 'Alert Publisher' },
      { id: 'incidents' as Page, icon: '📋', label: 'Incidents' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'agents'   as Page, icon: '🤖', label: 'AI Agents' },
      { id: 'terminal' as Page, icon: '⌨',  label: 'AI Terminal' },
    ]
  },
]

export default function Sidebar({ current, onNavigate, crisisCount, sosCount }: Props) {
  const getBadge = (key?: string) => {
    if (key === 'crisisCount') return crisisCount
    if (key === 'sosCount') return sosCount
    return 0
  }

  return (
    <aside className="sidebar">
      {sections.map(sec => (
        <div className="sidebar-section" key={sec.label}>
          <div className="sidebar-label">{sec.label}</div>
          {sec.items.map(item => {
            const badge = getBadge(item.badge)
            return (
              <div
                key={item.id}
                className={`sidebar-item${current === item.id ? ' active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <div className="sidebar-icon">{item.icon}</div>
                <div className="sidebar-text">{item.label}</div>
                {badge > 0 && <div className="sidebar-badge">{badge}</div>}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}