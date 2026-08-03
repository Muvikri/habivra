import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AtSign, UserRound } from "lucide-react"
import { authService } from "../services/authService"
import { useAuth } from "../contexts/AuthContext"
import { Emoji } from "../components/shared/Emoji"
import splashIcon from "../assets/habivra-splash-icon.png"

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, setUser } = useAuth()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!authLoading && user)
      navigate(user.onboarding_completed ? "/app/dashboard" : "/onboarding", {
        replace: true,
      })
  }, [authLoading, navigate, user])

  const continueWithProfile = (
    profile: Awaited<ReturnType<typeof authService.loginAsGuest>>,
  ) => {
    setUser(profile)
    navigate(profile.onboarding_completed ? "/app/dashboard" : "/onboarding")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedUsername = username.trim().toLowerCase()
    if (!USERNAME_PATTERN.test(normalizedUsername))
      return setErrorMsg(
        "Username gunakan 3–20 huruf kecil, angka, atau garis bawah.",
      )
    if (mode === "register" && !displayName.trim())
      return setErrorMsg("Display name wajib diisi.")
    if (password.length < 6)
      return setErrorMsg("Kata sandi minimal 6 karakter.")
    setLoading(true)
    setErrorMsg("")
    try {
      const profile =
        mode === "login"
          ? await authService.loginWithUsername(normalizedUsername, password)
          : await authService.registerWithUsername(
              displayName,
              normalizedUsername,
              password,
            )
      continueWithProfile(profile)
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : mode === "login"
            ? "Gagal masuk. Periksa username dan kata sandi."
            : "Gagal membuat akun.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setLoading(true)
    setErrorMsg("")
    try {
      continueWithProfile(await authService.loginAsGuest())
    } catch (error: unknown) {
      setErrorMsg(
        `Gagal masuk sebagai Tamu: ${
          error instanceof Error ? error.message : "Coba lagi."
        }`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative">
      <div className="pt-8 text-center">
        <div className="hidden">
          <Emoji size="3xl">🌍</Emoji>
        </div>
        <div className="mx-auto mb-4 size-16 overflow-hidden rounded-2xl border border-white/60 bg-[#fff5e3] shadow-sm">
          <img
            src={splashIcon}
            alt="Logo Habivra"
            className="size-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          {mode === "login" ? "Selamat Datang!" : "Buat Akun Baru"}
        </h1>
        <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
          {mode === "login"
            ? "Masuk dan lanjutkan kebiasaan hijaumu."
            : "Tidak perlu email. Cukup pilih username dan kata sandi."}
        </p>
      </div>

      <div className="my-auto space-y-4">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setMode(tab)
                setErrorMsg("")
              }}
              className={`py-2 rounded-lg text-xs font-black transition-colors ${
                mode === tab
                  ? "bg-[var(--bg-card)] text-[var(--accent-primary)] shadow-sm"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {tab === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <label className="block">
              <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
                Display name
              </span>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Isi nama kamu"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </label>
          )}
          <label className="block">
            <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Username
            </span>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
              <input
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
                placeholder="Isi username kamu"
                autoCapitalize="none"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
              Kata Sandi
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : mode === "login"
                ? "Masuk Sekarang"
                : "Buat Akun"}
          </button>
        </form>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[var(--border-subtle)]" />
          <span className="flex-shrink mx-3 text-[10px] font-bold text-[var(--text-muted)] uppercase">
            atau
          </span>
          <div className="flex-grow border-t border-[var(--border-subtle)]" />
        </div>
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-black hover:bg-[var(--accent-muted)] transition-all flex items-center justify-center gap-2"
        >
          <Emoji size="sm">👤</Emoji> Masuk sebagai Tamu
        </button>
      </div>
      <div className="pb-4 text-center">
        <p className="text-[11px] font-semibold text-[var(--text-muted)]">
          Dengan melanjutkan, Anda menyetujui Ketentuan & Kebijakan Privasi
          Habivra.
        </p>
      </div>
    </div>
  )
}
