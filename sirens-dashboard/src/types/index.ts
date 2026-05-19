import type { Timestamp, GeoPoint } from 'firebase/firestore'

// ─── Firestore collections ───────────────────────────────────────────────────

export interface Crisis {
  id: string
  crisisType: string
  severity: 'low' | 'medium' | 'high'
  credibilityScore: number   // 0–1
  explanation: string
  status: 'active' | 'resolved'
  location?: GeoPoint
  areaName?: string
  timestamp?: Timestamp
}

export interface DangerZone {
  id: string
  center: GeoPoint
  radiusKm: number
  active: boolean
  routePolyline?: string
  routeDistance?: string
  routeDuration?: string
  crisisId?: string
}

export interface Resource {
  id: string
  type: string
  location: GeoPoint
  available: boolean
}

export interface Alert {
  id: string
  alertId?: string
  type?: string
  title: string
  message: string
  city: string
  severity: 'low' | 'medium' | 'high'
  active: boolean
  timestamp?: Timestamp
}

export interface VerificationRequest {
  id: string
  crisisId: string
  description: string
  status: 'pending' | 'resolved'
  pollId?: string
  timestamp?: Timestamp
}

export interface AgentTrace {
  id: string
  agent: string
  rawReasoning: string
  timestamp?: Timestamp
}

export interface SOSSignal {
  id: string
  sosId?: string
  userId: string
  location: GeoPoint
  message?: string
  status: 'pending' | 'dispatched' | 'resolved'
  timestamp?: Timestamp
}

export interface Report {
  id: string
  reportId?: string
  userId: string
  imageUrl?: string
  category: string
  description: string
  location: GeoPoint
  areaName: string
  city: string
  timestamp?: Timestamp
  status: 'active' | 'resolved'
}

// ─── UI state ─────────────────────────────────────────────────────────────────

export type Page = 'overview' | 'map' | 'crises' | 'sos' | 'alerts' | 'incidents' | 'agents' | 'terminal'
export type ToastType = 'info' | 'success' | 'danger' | 'warning'

export interface Toast {
  id: string
  title: string
  msg: string
  type: ToastType
}