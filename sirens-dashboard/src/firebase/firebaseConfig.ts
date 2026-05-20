import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

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