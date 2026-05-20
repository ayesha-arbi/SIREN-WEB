import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070C1E',
    }}>
      <div style={{
        background: '#0D1526', border: '1px solid #1E2D4A',
        borderRadius: '12px', padding: '2.5rem', width: '100%', maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--accent, #3B82F6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', margin: '0 auto 1rem',
          }}>S</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', letterSpacing: 2 }}>SIRENS</div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', letterSpacing: 3, marginTop: 4 }}>
            AUTHORITY COMMAND CENTER
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          {error && (
            <div style={{ color: '#F87171', fontSize: '0.78rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#111827', border: '1px solid #1E2D4A', borderRadius: 8,
  padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none',
}

const btnStyle: React.CSSProperties = {
  background: 'var(--accent, #3B82F6)', color: '#fff', border: 'none',
  borderRadius: 8, padding: '0.75rem', fontWeight: 700,
  letterSpacing: 2, fontSize: '0.85rem', cursor: 'pointer', marginTop: 4,
}