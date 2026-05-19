import { useEffect, useState, useCallback } from 'react'
import {
  collection, onSnapshot, query, where,
  orderBy, limit, DocumentData, QuerySnapshot
} from 'firebase/firestore'
import { db, callable } from '@/lib/firebase'
import type { Crisis, DangerZone, Resource, Alert, VerificationRequest, AgentTrace, SOSSignal, Report } from '@/types'

// ─── helper: map snapshot to typed array ─────────────────────────────────────
function snap<T>(s: QuerySnapshot<DocumentData>): T[] {
  return s.docs.map(d => ({ id: d.id, ...d.data() } as T))
}

// ─── useCrises ────────────────────────────────────────────────────────────────
export function useCrises() {
  const [crises, setCrises] = useState<Crisis[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(collection(db, 'crises'), where('status', '==', 'active'))
    const unsub = onSnapshot(q, s => { setCrises(snap<Crisis>(s)); setLoading(false) })
    return unsub
  }, [])
  return { crises, loading }
}

// ─── useDangerZones ───────────────────────────────────────────────────────────
export function useDangerZones() {
  const [zones, setZones] = useState<DangerZone[]>([])
  useEffect(() => {
    const q = query(collection(db, 'danger_zones'), where('active', '==', true))
    return onSnapshot(q, s => setZones(snap<DangerZone>(s)))
  }, [])
  return zones
}

// ─── useResources ─────────────────────────────────────────────────────────────
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  useEffect(() => {
    return onSnapshot(collection(db, 'resources'), s => setResources(snap<Resource>(s)))
  }, [])
  return resources
}

// ─── useAlerts ────────────────────────────────────────────────────────────────
export function useAlerts(city = 'Karachi') {
  const [alerts, setAlerts] = useState<Alert[]>([])
  useEffect(() => {
    const q = query(
      collection(db, 'alerts'),
      where('city', '==', city),
      where('active', '==', true),
      orderBy('timestamp', 'desc'),
      limit(20)
    )
    return onSnapshot(q, s => setAlerts(snap<Alert>(s)))
  }, [city])
  return alerts
}

// ─── useVerificationRequests ──────────────────────────────────────────────────
export function useVerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  useEffect(() => {
    const q = query(collection(db, 'verification_requests'), where('status', '==', 'pending'))
    return onSnapshot(q, s => setRequests(snap<VerificationRequest>(s)))
  }, [])
  return requests
}

// ─── useAgentTraces ───────────────────────────────────────────────────────────
export function useAgentTraces(maxLines = 80) {
  const [traces, setTraces] = useState<AgentTrace[]>([])
  useEffect(() => {
    const q = query(
      collection(db, 'agent_traces'),
      orderBy('timestamp', 'desc'),
      limit(maxLines)
    )
    return onSnapshot(q, s => setTraces(snap<AgentTrace>(s).reverse()))
  }, [maxLines])
  return traces
}

// ─── useSOSSignals ────────────────────────────────────────────────────────────
export function useSOSSignals() {
  const [signals, setSignals] = useState<SOSSignal[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await callable.getSOSList()
      setSignals(res.data.signals)
    } catch (e) {
      console.error('getSOSList error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Also subscribe to sos_signals for real-time flashing indicators
  useEffect(() => {
    const q = query(
      collection(db, 'sos_signals'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    )
    const unsub = onSnapshot(q, s => {
      setSignals(snap<SOSSignal>(s))
      setLoading(false)
    })
    return unsub
  }, [])

  return { signals, loading, refresh }
}

// ─── useReports ───────────────────────────────────────────────────────────────
export function useReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const q = query(
      collection(db, 'reports'),
      orderBy('timestamp', 'desc'),
      limit(50)
    )
    return onSnapshot(q, s => { setReports(snap<Report>(s)); setLoading(false) })
  }, [])
  return { reports, loading }
}

// ─── useResolvedCount ─────────────────────────────────────────────────────────
export function useResolvedCount() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const q = query(collection(db, 'crises'), where('status', '==', 'resolved'))
    return onSnapshot(q, s => setCount(s.size))
  }, [])
  return count
}