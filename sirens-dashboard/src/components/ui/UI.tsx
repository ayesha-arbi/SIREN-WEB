import React, { ReactNode } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api'
import type { Crisis } from '@/types'

// ─── Panel ────────────────────────────────────────────────────────────────────
interface PanelProps {
  title: string
  icon?: string
  actions?: ReactNode
  noPad?: boolean
  children: ReactNode
  style?: React.CSSProperties
}

export function Panel({ title, icon, actions, noPad, children, style }: PanelProps) {
  return (
    <div className="panel" style={style}>
      <div className="panel-header">
        <div className="panel-title">
          {icon && <span className="panel-icon">{icon}</span>}
          {title}
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      <div className={`panel-body${noPad ? ' no-pad' : ''}`}>{children}</div>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatProps { 
  label: string; 
  value: string | number; 
  change?: string; 
  color: 'blue' | 'red' | 'green' | 'orange'; 
  icon?: string 
}

export function StatCard({ label, value, change, color, icon }: StatProps) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
      {icon && <div className="stat-icon">{icon}</div>}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'high' | 'medium' | 'low' | 'blue' | 'active' | 'yellow'

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  const cls: Record<BadgeVariant, string> = {
    high: 'badge-high', 
    medium: 'badge-medium', 
    low: 'badge-low',
    blue: 'badge-blue', 
    active: 'badge-active',
    yellow: 'badge-yellow',
  }
  return <span className={`badge ${cls[variant]}`}>{children}</span>
}

// ─── Severity badge helper ────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: Crisis['severity'] }) {
  return <Badge variant={severity}>{severity.toUpperCase()}</Badge>
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'danger' | 'success' | 'ghost'

interface BtnProps {
  variant?: BtnVariant
  size?: 'sm' | 'xs'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: ReactNode
  style?: React.CSSProperties
  fullWidth?: boolean
}

export function Btn({ variant = 'primary', size, onClick, disabled, loading, children, style, fullWidth }: BtnProps) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : ''].filter(Boolean).join(' ')
  return (
    <button
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...(fullWidth ? { width: '100%', justifyContent: 'center' } : {}), ...style }}
    >
      {loading ? '⏳ Loading…' : children}
    </button>
  )
}

// ─── LivePill ─────────────────────────────────────────────────────────────────
export function LivePill({ label = 'LIVE' }: { label?: string }) {
  return (
    <div className="status-pill">
      <div className="pulse-dot" />
      {label}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, msg }: { icon?: string; msg: string }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-icon">{icon}</div>}
      {msg}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
      <div style={{ marginBottom: 8 }}>
        <div className="progress-bar" style={{ width: 120, margin: '0 auto' }}>
          <div className="progress-fill" />
        </div>
      </div>
      LOADING…
    </div>
  )
}

// ─── ConfidenceBar ────────────────────────────────────────────────────────────
export function ConfidenceBar({ score, severity }: { score: number; severity: Crisis['severity'] }) {
  const colors: Record<Crisis['severity'], string> = {
    high: 'var(--red-hot)', 
    medium: 'var(--orange)', 
    low: 'var(--green-ok)'
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <div className="confidence-bar-wrap">
        <div className="confidence-bar" style={{ width: `${score * 100}%`, background: colors[severity] }} />
      </div>
      <span className="confidence-label">{Math.round(score * 100)}%</span>
    </div>
  )
}

// ─── Map canvas (Real Google Maps) ────────────────────────────────────────────
interface MapProps { 
  height?: number; 
  children?: ReactNode 
}

export function MapCanvas({ height = 380, children }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'
  })

  const center = { lat: 24.8607, lng: 67.0011 } // Karachi center

  return (
    <div className="map-container" style={{ height, position: 'relative' }}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={12}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            styles: [
              {
                "featureType": "all",
                "elementType": "geometry",
                "color": "#1a1a2e"
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "color": "#0f0f1a"
              }
            ]
          }}
        >
          {/* You can map over Markers or Circles using children here */}
          {children}
        </GoogleMap>
      ) : (
        <div className="map-loading" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-panel)' }}>
          <Spinner />
        </div>
      )}
    </div>
  )
}

// ─── Resolve / Agent-5 modal ──────────────────────────────────────────────────
interface ResolveModalProps {
  crisisId: string | null
  crisisName: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function ResolveModal({ crisisId, crisisName, onClose, onConfirm, loading }: ResolveModalProps) {
  if (!crisisId) return null

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>🎯</div>
        <div className="modal-title">Trigger Agent 5: Impact Evaluation</div>
        <div className="modal-sub">CRISIS: {crisisId} — {crisisName}</div>
        
        <div style={{ background: 'rgba(34,114,232,0.06)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Running Agent 5 will:<br />
          <span style={{ color: 'var(--green-ok)' }}>✓</span> Analyse pre/post incident conditions<br />
          <span style={{ color: 'var(--green-ok)' }}>✓</span> Clear danger zone from the map<br />
          <span style={{ color: 'var(--green-ok)' }}>✓</span> Free all deployed ambulances<br />
          <span style={{ color: 'var(--green-ok)' }}>✓</span> Send "Crisis Resolved" alert to citizens<br />
          <span style={{ color: 'var(--green-ok)' }}>✓</span> Archive all associated reports
        </div>

        <div className="modal-actions">
          <Btn variant="ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
          <Btn variant="success" onClick={onConfirm} loading={loading} style={{ flex: 2, justifyContent: 'center' }}>▶ Confirm &amp; Run Agent 5</Btn>
        </div>
      </div>
    </div>
  )
}