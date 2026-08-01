import { useState, useCallback, useRef } from 'react'

export interface ToastItem {
  id: number
  msg: string
  type?: 'info' | 'success' | 'error'
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const show = useCallback((msg: string, type: ToastItem['type'] = 'info') => {
    const id = ++counter.current
    setToasts(t => [...t.slice(-2), { id, msg, type }]) // max 3 active
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id))
    }, 2400)
  }, [])

  return { toasts, show }
}
