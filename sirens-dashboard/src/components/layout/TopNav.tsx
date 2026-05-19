import { useEffect, useState } from 'react'

export default function TopNav() {
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
        <div className="auth-name">Authority Command</div>
      </div>
    </nav>
  )
}