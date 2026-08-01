import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import { Emoji } from '../components/shared/Emoji'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [authLoading, navigate, user])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const profile = await authService.loginWithEmail(email, password)
      setUser(profile)
      navigate(profile.onboarding_completed ? '/app/dashboard' : '/onboarding')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal masuk. Periksa email & password Anda.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const profile = await authService.loginAsGuest()
      setUser(profile)
      navigate(profile.onboarding_completed ? '/app/dashboard' : '/onboarding')
    } catch {
      setErrorMsg('Gagal masuk sebagai Tamu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative">
      <div className="pt-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Emoji size="3xl">🌍</Emoji>
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Selamat Datang!</h1>
        <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
          Mulai langkah kecilmu menuju gaya hidup yang lebih ramah lingkungan.
        </p>
      </div>

      <div className="my-auto space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-[var(--text-muted)] uppercase">atau</span>
          <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-black hover:bg-[var(--accent-muted)] transition-all flex items-center justify-center gap-2"
        >
          <Emoji size="sm">👤</Emoji>
          Masuk sebagai Tamu
        </button>
      </div>

      <div className="pb-4 text-center">
        <p className="text-[11px] font-semibold text-[var(--text-muted)]">
          Dengan melanjutkan, Anda menyetujui Ketentuan & Kebijakan Privasi Habivra.
        </p>
      </div>
    </div>
  )
}
