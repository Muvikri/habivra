import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/layout/PageHeader"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../hooks/useTheme"
import { authService } from "../services/authService"
import { notificationService } from "../services/notificationService"
import { userService } from "../services/userService"
import type { Theme } from "../types"
import { Emoji } from "../components/shared/Emoji"
import { BottomNav } from "../components/layout/BottomNav"
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  LogOut,
  Heart,
  Sparkles,
  Camera,
  Pencil,
  UserPlus,
  X,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "../hooks/useToast"
import { ToastProvider } from "../components/shared/ToastProvider"

const DEFAULT_REMINDER_HOUR = 20
const DEFAULT_REMINDER_MINUTE = 0

function formatReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toasts, show: showToast } = useToast()

  const [reflectionSelected, setReflectionSelected] = useState<string | null>(
    null,
  )
  const [reflectionAiReply, setReflectionAiReply] = useState<string | null>(
    null,
  )
  const [reminder, setReminder] = useState(user?.reminder_enabled ?? true)
  const [reminderHour, setReminderHour] = useState(
    user?.reminder_hour ?? DEFAULT_REMINDER_HOUR,
  )
  const [reminderMinute, setReminderMinute] = useState(
    user?.reminder_minute ?? DEFAULT_REMINDER_MINUTE,
  )
  const [savingReminder, setSavingReminder] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showGuestLogoutWarning, setShowGuestLogoutWarning] = useState(false)
  const [profileName, setProfileName] = useState(user?.name || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "")
  const [savingProfile, setSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setReminder(user?.reminder_enabled ?? true)
    setReminderHour(user?.reminder_hour ?? DEFAULT_REMINDER_HOUR)
    setReminderMinute(user?.reminder_minute ?? DEFAULT_REMINDER_MINUTE)
  }, [user?.reminder_enabled, user?.reminder_hour, user?.reminder_minute])

  const moods = [
    {
      emoji: "🤩",
      label: "Luar Biasa",
      reply:
        "Hebat! Konsistensimu minggu ini sungguh menginspirasi. Pertahankan!",
    },
    {
      emoji: "😊",
      label: "Senang",
      reply: "Bagus sekali! Setiap aksi kecilmu berdampak bagi bumi.",
    },
    {
      emoji: "😐",
      label: "Biasa Saja",
      reply: "Tidak apa-apa, yang penting kamu tetap berusaha setiap hari.",
    },
    {
      emoji: "😓",
      label: "Tantangan",
      reply:
        "Jangan patah semangat! Besok adalah kesempatan baru untuk mencoba lagi.",
    },
  ]

  const handleSelectMood = (mood: typeof moods[0]) => {
    setReflectionSelected(mood.label)

    // Fix Bug #5: Proper JSX interpolation string formatting
    setReflectionAiReply(`Refleksi "${mood.label}": ${mood.reply}`)
  }

  const handleToggleReminder = async () => {
    const nextVal = !reminder
    if (!user) return

    setReminder(nextVal)

    if (nextVal) {
      const permissionGranted = await notificationService.scheduleDailyReminder(
        reminderHour,
        reminderMinute,
      )
      if (!permissionGranted) {
        setReminder(false)
        await userService.updateProfile(user.id, { reminder_enabled: false })
        setUser({ ...user, reminder_enabled: false })
        showToast(
          "Izin notifikasi ditolak. Buka pengaturan perangkat untuk mengaktifkannya.",
          "error",
        )
        return
      }
    } else {
      await notificationService.cancelDailyReminder()
    }

    try {
      const updatedUser = await userService.updateProfile(user.id, {
        reminder_enabled: nextVal,
        reminder_hour: reminderHour,
        reminder_minute: reminderMinute,
      })
      setUser(updatedUser)
      showToast(
        nextVal
          ? `Pengingat harian diaktifkan setiap hari pukul ${formatReminderTime(reminderHour, reminderMinute)} 🔔`
          : "Pengingat harian dinonaktifkan",
        "info",
      )
    } catch (error) {
      setReminder(!nextVal)
      if (nextVal) {
        await notificationService.cancelDailyReminder()
      } else {
        await notificationService.scheduleDailyReminder(
          user.reminder_hour ?? DEFAULT_REMINDER_HOUR,
          user.reminder_minute ?? DEFAULT_REMINDER_MINUTE,
        )
      }
      showToast(
        error instanceof Error
          ? error.message
          : "Tidak dapat menyimpan preferensi notifikasi.",
        "error",
      )
    }
  }

  const handleSaveReminderTime = async () => {
    if (!user) return
    if (
      !Number.isInteger(reminderHour) ||
      !Number.isInteger(reminderMinute) ||
      reminderHour < 0 ||
      reminderHour > 23 ||
      reminderMinute < 0 ||
      reminderMinute > 59
    ) {
      showToast("Masukkan jam 0–23 dan menit 0–59.", "error")
      return
    }

    setSavingReminder(true)
    try {
      if (reminder) {
        const scheduled = await notificationService.scheduleDailyReminder(
          reminderHour,
          reminderMinute,
        )
        if (!scheduled) {
          showToast(
            "Izin notifikasi ditolak. Buka pengaturan perangkat untuk mengaktifkannya.",
            "error",
          )
          return
        }
      }
      const updatedUser = await userService.updateProfile(user.id, {
        reminder_hour: reminderHour,
        reminder_minute: reminderMinute,
      })
      setUser(updatedUser)
      showToast(
        `Waktu pengingat disimpan: ${formatReminderTime(reminderHour, reminderMinute)}.`,
        "success",
      )
    } catch (error) {
      if (reminder) {
        await notificationService.scheduleDailyReminder(
          user.reminder_hour ?? DEFAULT_REMINDER_HOUR,
          user.reminder_minute ?? DEFAULT_REMINDER_MINUTE,
        )
      }
      showToast(
        error instanceof Error
          ? error.message
          : "Waktu pengingat belum dapat disimpan.",
        "error",
      )
    } finally {
      setSavingReminder(false)
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    showToast(
      `Tema diubah ke ${
        newTheme === "dark"
          ? "Gelap"
          : newTheme === "light"
            ? "Terang"
            : "Sistem"
      }`,
      "info",
    )
  }

  const handleLogout = async () => {
    if (user?.is_guest || !user?.username) {
      setShowGuestLogoutWarning(true)
      return
    }
    await authService.logout()
    setUser(null)
    navigate("/login")
  }

  const confirmGuestLogout = async () => {
    await authService.logout()
    setUser(null)
    navigate("/login")
  }

  const handleCompleteAccount = () => {
    navigate("/setup/account")
  }

  const handleAvatarChange = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async () => {
    if (!user || !profileName.trim()) return
    setSavingProfile(true)
    try {
      const avatarUrl = avatarFile
        ? await userService.uploadAvatar(user.id, avatarFile)
        : user.avatar_url
      const updatedUser = await userService.updateProfile(user.id, {
        name: profileName.trim(),
        avatar_url: avatarUrl,
      })
      setUser(updatedUser)
      setShowProfileEditor(false)
      showToast("Profil berhasil diperbarui", "success")
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Profil belum dapat diperbarui",
        "error",
      )
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ToastProvider toasts={toasts} />

      <div className="p-5 space-y-5">
        <PageHeader
          title="Profil Saya"
          subtitle="Pengaturan akun & refleksi mingguan"
        />

        {(user?.is_guest || !user?.username) && (
          <button
            type="button"
            onClick={handleCompleteAccount}
            className="w-full p-4 rounded-2xl bg-[var(--accent-primary)] text-left text-white shadow-md transition-transform active:scale-[0.98]"
          >
            <span className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-white/15">
                <UserPlus className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-black">
                  Jangan biarkan progresmu hilang
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold text-white/85">
                  Isi username-mu agar bisa login lagi dan menyimpan akunmu.
                </span>
              </span>
              <span className="text-xs font-black self-center">
                Isi sekarang
              </span>
            </span>
          </button>
        )}

        {/* User Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border-default)] shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-[var(--accent-muted)] border-2 border-[var(--border-default)] flex items-center justify-center shrink-0 shadow-md overflow-hidden">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt="Foto profil"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <Emoji size="3xl">🌿</Emoji>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-[var(--text-primary)] truncate">
              {user?.name || "Eco Warrior"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {user?.username && (
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  @{user.username}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)] text-white">
                Level {user?.level || 1} • {user?.level_name || "Pemula Hijau"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowProfileEditor(true)}
            aria-label="Edit profil"
            className="p-2 rounded-xl text-[var(--accent-primary)] hover:bg-[var(--accent-muted)]"
          >
            <Pencil className="size-4" />
          </button>
        </div>

        {showProfileEditor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  Edit Profil
                </h2>
                <button
                  onClick={() => setShowProfileEditor(false)}
                  aria-label="Tutup"
                  className="p-2 text-[var(--text-muted)]"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-24 h-24 overflow-hidden rounded-3xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-primary)]"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Pratinjau foto profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Emoji size="3xl">🌿</Emoji>
                  )}
                  <span className="absolute bottom-0 right-0 p-2 rounded-tl-xl bg-[var(--accent-primary)] text-white">
                    <Camera className="size-4" />
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    handleAvatarChange(event.target.files?.[0])
                  }
                />
                <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Pilih gambar hingga 2 MB
                </p>
              </div>
              <label className="block mt-5 text-xs font-bold text-[var(--text-primary)]">
                Nama tampilan
              </label>
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                maxLength={40}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || !profileName.trim()}
                className="w-full mt-5 py-3.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black disabled:opacity-50"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        )}

        {/* Weekly Reflection Card */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Refleksi Mingguan
            </h3>
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            Bagaimana perasaanmu tentang progres habit ramah lingkunganmu minggu
            ini?
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {moods.map((m, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectMood(m)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  reflectionSelected === m.label
                    ? "bg-[var(--bg-secondary)] border-[var(--accent-primary)] scale-105"
                    : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--accent-muted)]"
                }`}
              >
                <Emoji size="xl">{m.emoji}</Emoji>
                <span className="text-[10px] font-bold text-[var(--text-primary)]">
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {/* Fix Bug #5: Reflection response */}
          {reflectionAiReply && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] flex items-start gap-2.5 slide-up">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{reflectionAiReply}</p>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-[var(--text-primary)] px-1">
            Pengaturan Tampilan & Aplikasi ⚙️
          </h3>

          {/* Fix Bug #1: Theme Selector */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs space-y-3">
            <label className="text-xs font-extrabold text-[var(--text-primary)] block">
              Tema Tampilan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleThemeChange("light")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "light"
                    ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
                }`}
              >
                <Sun className="w-4 h-4" />
                Terang
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
                }`}
              >
                <Moon className="w-4 h-4" />
                Gelap
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  theme === "system"
                    ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
                }`}
              >
                <Monitor className="w-4 h-4" />
                Sistem
              </button>
            </div>
          </div>

          {/* Reminder Toggle */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[var(--accent-primary)]" />
              <div>
                <p className="text-xs font-extrabold text-[var(--text-primary)]">
                  Pengingat Harian
                </p>
                <p className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Notifikasi jadwal habit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleReminder}
                disabled={savingReminder}
                className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                  reminder
                    ? "bg-[var(--accent-primary)] justify-end"
                    : "bg-[var(--border-default)] justify-start"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
              <span className="hidden text-xs font-semibold text-[var(--text-primary)]">
                {reminder ? "Aktif" : "Mati"} • setiap hari pukul 20.00
              </span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex-1 text-[11px] font-bold text-[var(--text-muted)]">
              Jam
              <input
                aria-label="Jam pengingat"
                type="number"
                min="0"
                max="23"
                value={reminderHour}
                onChange={(event) =>
                  setReminderHour(Number(event.target.value))
                }
                className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </label>
            <span className="pb-2 text-lg font-black text-[var(--text-primary)]">
              :
            </span>
            <label className="flex-1 text-[11px] font-bold text-[var(--text-muted)]">
              Menit
              <input
                aria-label="Menit pengingat"
                type="number"
                min="0"
                max="59"
                value={reminderMinute}
                onChange={(event) =>
                  setReminderMinute(Number(event.target.value))
                }
                className="mt-1 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveReminderTime}
              disabled={savingReminder}
              className="rounded-xl bg-[var(--accent-primary)] px-3 py-2 text-xs font-black text-white disabled:opacity-50"
            >
              {savingReminder ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
          <p className="text-[11px] font-semibold text-[var(--text-muted)]">
            {reminder ? "Aktif" : "Mati"} • setiap hari pukul{" "}
            {formatReminderTime(reminderHour, reminderMinute)}
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 text-xs font-black transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari Akun
          </button>
        </div>
      </div>

      <BottomNav />

      {showGuestLogoutWarning && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-logout-title"
        >
          <div className="w-full max-w-md rounded-t-3xl border-x border-t border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-2xl sm:rounded-3xl sm:border">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
              <AlertTriangle className="size-6" />
            </div>
            <h2 id="guest-logout-title" className="text-lg font-black text-[var(--text-primary)]">
              Kamu masih memakai akun guest
            </h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[var(--text-muted)]">
              Jika keluar sekarang, kamu tidak punya username dan kata sandi untuk masuk kembali. Progres akun guest ini bisa sulit dipulihkan.
            </p>
            <button
              type="button"
              onClick={handleCompleteAccount}
              className="mt-5 w-full rounded-2xl bg-[var(--accent-primary)] px-4 py-3 text-sm font-black text-white"
            >
              Lengkapi akun dulu
            </button>
            <button
              type="button"
              onClick={() => void confirmGuestLogout()}
              className="mt-2 w-full rounded-2xl px-4 py-3 text-sm font-black text-red-500"
            >
              Tetap keluar
            </button>
            <button
              type="button"
              onClick={() => setShowGuestLogoutWarning(false)}
              className="mt-1 w-full rounded-2xl px-4 py-3 text-sm font-bold text-[var(--text-muted)]"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
