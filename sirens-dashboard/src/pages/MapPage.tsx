import { useEffect, useRef, useState } from 'react'
import { useCrises, useDangerZones, useSOSSignals, useResources } from '@/hooks/userFirestore'

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

const SEVERITY_COLOR = { high: '#FF3B3B', medium: '#FF9500', low: '#34C759' }
const STATUS_COLOR   = { pending: '#FF3B3B', dispatched: '#FF9500', resolved: '#34C759' }

const LEGEND = [
  { color: '#FF3B3B', label: 'Crisis (High)' },
  { color: '#FF9500', label: 'Crisis (Medium)' },
  { color: '#34C759', label: 'Crisis (Low)' },
  { color: '#FF375F', label: 'Danger Zone' },
  { color: '#BF5AF2', label: 'SOS Signal' },
  { color: '#0A84FF', label: 'Resource' },
]

export default function MapPage() {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapObj      = useRef<google.maps.Map | null>(null)
  const markers     = useRef<google.maps.Marker[]>([])
  const circles     = useRef<google.maps.Circle[]>([])
  const infoWindow  = useRef<google.maps.InfoWindow | null>(null)

  const { crises }       = useCrises()
  const zones            = useDangerZones()
  const { signals }      = useSOSSignals()
  const resources        = useResources()

  const [loaded, setLoaded]   = useState(false)
  const [filter, setFilter]   = useState({ crises: true, zones: true, sos: true, resources: true })
  const [counts, setCounts]   = useState({ crises: 0, zones: 0, sos: 0, resources: 0 })

  // ── Load Google Maps script ──────────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) { setLoaded(true); return }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) { console.error('VITE_GOOGLE_MAPS_API_KEY not set'); return }

    window.initMap = () => setLoaded(true)
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`
    s.async = true
    document.head.appendChild(s)
    return () => { document.head.removeChild(s) }
  }, [])

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded || !mapRef.current) return
    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 24.8607, lng: 67.0011 }, // Karachi
      zoom: 12,
      mapTypeId: 'roadmap',
      styles: darkMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })
    infoWindow.current = new window.google.maps.InfoWindow()
  }, [loaded])

  // ── Clear helpers ────────────────────────────────────────────────────────
  const clearOverlays = () => {
    markers.current.forEach(m => m.setMap(null))
    circles.current.forEach(c => c.setMap(null))
    markers.current = []
    circles.current = []
  }

  // ── Draw overlays whenever data or filter changes ────────────────────────
  useEffect(() => {
    if (!mapObj.current || !loaded) return
    clearOverlays()

    const map = mapObj.current
    const iw  = infoWindow.current!

    let cCount = 0, zCount = 0, sCount = 0, rCount = 0

    // Crises
    if (filter.crises) {
      crises.forEach(c => {
        if (!c.location) return
        const pos = { lat: c.location.latitude, lng: c.location.longitude }
        const m = new window.google.maps.Marker({
          position: pos,
          map,
          title: c.crisisType,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: SEVERITY_COLOR[c.severity],
            fillOpacity: 0.95,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        })
        m.addListener('click', () => {
          iw.setContent(infoHtml(
            '⚡ ' + c.crisisType,
            [
              ['Severity', c.severity.toUpperCase()],
              ['Area', c.areaName ?? '—'],
              ['Credibility', Math.round(c.credibilityScore * 100) + '%'],
              ['Status', c.status.toUpperCase()],
              ['Note', c.explanation],
            ],
            SEVERITY_COLOR[c.severity]
          ))
          iw.open(map, m)
        })
        markers.current.push(m)
        cCount++
      })
    }

    // Danger zones
    if (filter.zones) {
      zones.forEach(z => {
        if (!z.center) return
        const pos = { lat: z.center.latitude, lng: z.center.longitude }
        const circle = new window.google.maps.Circle({
          center: pos,
          radius: z.radiusKm * 1000,
          map,
          strokeColor: '#FF375F',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: '#FF375F',
          fillOpacity: 0.15,
        })
        circle.addListener('click', () => {
          iw.setContent(infoHtml(
            '🚨 Danger Zone',
            [
              ['Radius', z.radiusKm + ' km'],
              ['Route Distance', z.routeDistance ?? '—'],
              ['Route Duration', z.routeDuration ?? '—'],
            ],
            '#FF375F'
          ))
          iw.setPosition(pos)
          iw.open(map)
        })
        circles.current.push(circle)
        zCount++
      })
    }

    // SOS signals
    if (filter.sos) {
      signals.forEach(s => {
        if (!s.location) return
        const pos = { lat: s.location.latitude, lng: s.location.longitude }
        const m = new window.google.maps.Marker({
          position: pos,
          map,
          title: 'SOS',
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: STATUS_COLOR[s.status] ?? '#BF5AF2',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 1,
            scale: 1.6,
            anchor: new window.google.maps.Point(12, 22),
          },
        })
        m.addListener('click', () => {
          iw.setContent(infoHtml(
            '🆘 SOS Signal',
            [
              ['User', s.userId],
              ['Status', s.status.toUpperCase()],
              ['Message', s.message ?? '—'],
              ['Time', s.timestamp?.toDate().toLocaleString() ?? '—'],
            ],
            '#BF5AF2'
          ))
          iw.open(map, m)
        })
        markers.current.push(m)
        sCount++
      })
    }

    // Resources
    if (filter.resources) {
      resources.forEach(r => {
        if (!r.location) return
        const pos = { lat: r.location.latitude, lng: r.location.longitude }
        const m = new window.google.maps.Marker({
          position: pos,
          map,
          title: r.type,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: r.available ? '#0A84FF' : '#636366',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 1.5,
          },
        })
        m.addListener('click', () => {
          iw.setContent(infoHtml(
            '🔧 ' + r.type,
            [['Available', r.available ? 'Yes' : 'No']],
            r.available ? '#0A84FF' : '#636366'
          ))
          iw.open(map, m)
        })
        markers.current.push(m)
        rCount++
      })
    }

    setCounts({ crises: cCount, zones: zCount, sos: sCount, resources: rCount })
  }, [loaded, crises, zones, signals, resources, filter])

  const toggleFilter = (key: keyof typeof filter) =>
    setFilter(f => ({ ...f, [key]: !f[key] }))

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-title">Live Map</div>
        <div className="page-subtitle">REAL-TIME SITUATIONAL OVERVIEW — KARACHI</div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {([
          { key: 'crises',    label: 'Crises',      color: '#FF9500', count: counts.crises },
          { key: 'zones',     label: 'Danger Zones', color: '#FF375F', count: counts.zones },
          { key: 'sos',       label: 'SOS Signals',  color: '#BF5AF2', count: counts.sos },
          { key: 'resources', label: 'Resources',    color: '#0A84FF', count: counts.resources },
        ] as const).map(({ key, label, color, count }) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter[key] ? color : 'var(--border-subtle)'}`,
              background: filter[key] ? color + '22' : 'transparent',
              color: filter[key] ? color : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: 600, letterSpacing: 1,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: filter[key] ? color : 'var(--border-subtle)',
              display: 'inline-block',
            }} />
            {label}
            <span style={{
              background: filter[key] ? color : 'var(--border-subtle)',
              color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: '0.7rem',
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Map container */}
      <div style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', minHeight: 500 }}>
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0, background: '#0D1526',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: 2,
          }}>
            <div style={{ fontSize: 32 }}>🗺️</div>
            LOADING MAP…
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(7,12,30,0.92)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '12px 16px', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: 2, marginBottom: 8 }}>LEGEND</div>
          {LEGEND.map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── InfoWindow HTML ───────────────────────────────────────────────────────────
function infoHtml(title: string, rows: [string, string][], accent: string) {
  const rowsHtml = rows.map(([k, v]) => `
    <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:4px">
      <span style="color:#8899aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:1px">${k}</span>
      <span style="color:#fff;font-size:0.75rem;font-weight:600;text-align:right;max-width:180px">${v}</span>
    </div>`).join('')
  return `
    <div style="background:#0D1526;border:1px solid ${accent}44;border-radius:8px;padding:14px 16px;min-width:220px;font-family:monospace">
      <div style="color:${accent};font-weight:700;font-size:0.85rem;margin-bottom:10px;letter-spacing:1px">${title}</div>
      ${rowsHtml}
    </div>`
}

// ── Dark map styles ───────────────────────────────────────────────────────────
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7a99' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#9aa3bc' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a99' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3a4a6b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2d4a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d1526' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#243558' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a2840' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#aabbcc' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111827' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a99' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060d1e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a4a6b' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#060d1e' }] },
]