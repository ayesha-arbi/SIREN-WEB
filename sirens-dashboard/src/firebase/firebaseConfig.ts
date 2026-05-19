import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyCCkG0Blnh2BGus-XiJQWCT1e1H8LUdNlU',
  authDomain: 'sirens-451958.firebaseapp.com',
  projectId: 'sirens-451958',
  storageBucket: 'sirens-451958.firebasestorage.app',
  messagingSenderId: '895118049933',
  appId: '1:895118049933:web:e3d209ff15c3e4e0b218c4',
  measurementId: 'G-JEVD5LW08Q',
}

export const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)
export const fns  = getFunctions(app)

// ─── Typed callables ────────────────────────────────────────────────────────
export const callable = {
  getSOSList:             httpsCallable<void,           { signals: SOSSignal[] }>(fns, 'getSOSList'),
  sendOfficialAlert:      httpsCallable<SendAlertArgs,  { success: true; alertId: string }>(fns, 'sendOfficialAlert'),
  resolveReport:          httpsCallable<{ reportId: string }, { success: true }>(fns, 'resolveReport'),
  triggerImpactEvaluation:httpsCallable<{ crisisId: string }, { success: true }>(fns, 'triggerImpactEvaluation'),
  submitPollVote:         httpsCallable<{ pollId: string; vote: 'yes' | 'no' }, { success: true }>(fns, 'submitPollVote'),
}

// ─── Shared arg types used above ────────────────────────────────────────────
import type { SOSSignal } from '@/types'
interface SendAlertArgs { title: string; message: string; city: string; severity: 'low' | 'medium' | 'high' }