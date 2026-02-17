import { useState, useEffect } from 'react'

let _addToast = null
export const toast = (opts) => { if (_addToast) _addToast(opts) }

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = ({ message, type = 'info', duration = 4000 }) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return () => { _addToast = null }
  }, [])

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
  const bg = { success: 'rgba(16,185,129,0.12)', error: 'rgba(239,68,68,0.12)', info: 'rgba(20,184,166,0.12)', warning: 'rgba(251,191,36,0.12)' }
  const border = { success: 'rgba(16,185,129,0.3)', error: 'rgba(239,68,68,0.3)', info: 'rgba(20,184,166,0.3)', warning: 'rgba(251,191,36,0.3)' }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 14, fontSize: 13,
          background: bg[t.type], border: `1px solid ${border[t.type]}`,
          color: 'var(--text-primary)', backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <span>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
