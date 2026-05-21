import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Toast, ToastType } from '@/types'

interface ToastCtx {
  showToast: (title: string, msg: string, type?: ToastType) => void
}

const Ctx = createContext<ToastCtx>({ showToast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, msg: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts(p => [...p, { id, title, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500)
  }, [])

  const icons: Record<ToastType, string> = { info: 'ℹ️', success: '✅', danger: '🚨', warning: '⚠️' }

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', top: 70, right: 20, zIndex: 999,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ fontSize: '1.1rem' }}>{icons[t.type]}</span>
            <div>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)