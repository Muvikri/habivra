import { ToastItem } from '../../hooks/useToast'

interface ToastProviderProps {
  toasts: ToastItem[]
}

export function ToastProvider({ toasts }: ToastProviderProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-xs">
      {toasts.map(t => {
        const isSuccess = t.type === 'success'
        const isError = t.type === 'error'

        return (
          <div
            key={t.id}
            className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold text-center slide-up shadow-xl backdrop-blur-md transition-all border"
            style={{
              background: isSuccess
                ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                : isError
                ? 'linear-gradient(135deg,#dc2626,#ef4444)'
                : 'var(--bg-elevated)',
              color: isSuccess || isError ? '#ffffff' : 'var(--text-primary)',
              borderColor: isSuccess ? '#22c55e' : isError ? '#ef4444' : 'var(--border-default)',
            }}
          >
            {t.msg}
          </div>
        )
      })}
    </div>
  )
}
