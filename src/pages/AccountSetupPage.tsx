import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, UserRound } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { userService } from "../services/userService"
import { authService } from "../services/authService"
import splashIcon from "../assets/habivra-splash-icon.png"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AccountSetupPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.name ?? "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!displayName.trim())
      return setErrorMessage("Nama tampilan wajib diisi.")
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return setErrorMessage("Masukkan alamat email yang valid.")
    }
    if (password.length < 6)
      return setErrorMessage("Kata sandi minimal 6 karakter.")
    if (password !== confirmPassword)
      return setErrorMessage("Konfirmasi kata sandi tidak sama.")
    if (!user) return
    setSaving(true)
    setErrorMessage("")
    try {
      await authService.upgradeGuestAccount(normalizedEmail, password)
      const updated = await userService.updateProfile(user.id, {
        name: displayName.trim(),
        is_guest: false,
      })
      setUser(updated)
      navigate("/onboarding", { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Akun belum dapat disiapkan.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative">
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => navigate("/app/profile")}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-muted)]"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </button>
        <div className="mx-auto mb-4 size-16 overflow-hidden rounded-2xl border border-white/60 bg-[#fff5e3] shadow-sm">
          <img
            src={splashIcon}
            alt="Logo Habivra"
            className="size-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          Buat identitasmu
        </h1>
        <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
          Lengkapi akunmu agar progres ini bisa kamu akses lagi kapan saja.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="my-auto space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}
        <label className="block">
          <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
            Display name
          </span>
          <div className="relative">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={40}
              placeholder="Isi nama kamu"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
            Kata sandi
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            placeholder="Minimal 6 karakter"
            required
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
            Konfirmasi Kata Sandi
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            placeholder="Ulangi kata sandi"
            autoComplete="new-password"
            required
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-[var(--text-muted)] mb-1">
            Email
          </span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Lanjutkan"}
        </button>
      </form>
      <p className="pb-4 text-center text-[11px] font-semibold text-[var(--text-muted)]">
        Kamu dapat mengubah display name nanti dari profil.
      </p>
    </div>
  )
}
