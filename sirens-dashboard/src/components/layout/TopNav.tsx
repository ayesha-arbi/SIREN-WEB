import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function TopNav() {
  const { user, logout } = useAuth()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-GB'))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav className="topnav">
      <div className="nav-brand">
        <div className="nav-logo">S</div>
        <div>
          <div className="nav-title">SIRENS</div>
          <div className="nav-subtitle">AUTHORITY COMMAND CENTER</div>
        </div>
      </div>
      <div className="nav-status">
        <div className="status-pill">
          <div className="pulse-dot" />
          ALL SYSTEMS OPERATIONAL
        </div>
        <div className="nav-time">{time}</div>
      </div>
      <div className="nav-auth">
        <div className="auth-avatar">AC</div>
        <div className="auth-name">{user?.email ?? 'Authority Command'}</div>
        <button
          onClick={logout}
          style={{
            marginLeft: '0.75rem', background: 'transparent',
            border: '1px solid #1E2D4A', borderRadius: 6,
            color: '#9CA3AF', fontSize: '0.7rem', padding: '4px 10px',
            cursor: 'pointer', letterSpacing: 1,
          }}
        >
          LOGOUT
        </button>
      </div>
    </nav>
  )
}