import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { habitService } from '../services/habitService'
import { userService } from '../services/userService'
import type { Habit } from '../types'
import { XPBar } from '../components/shared/XPBar'
import { StreakBadge } from '../components/shared/StreakBadge'
import { EcoImpactGrid } from '../components/shared/EcoImpactGrid'
import { WeekDots } from '../components/shared/WeekDots'
import { HabitCard } from '../components/shared/HabitCard'
import { HabitCardSkeleton } from '../components/shared/Skeletons'
import { BottomNav } from '../components/layout/BottomNav'
import { Emoji } from '../components/shared/Emoji'
import { Bell, CheckCircle, Plus, X } from 'lucide-react'
import { MOCK_HABITS } from '../constants/mockData'
import { useToast } from '../hooks/useToast'
import { ToastProvider } from '../components/shared/ToastProvider'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const { toasts, show: showToast } = useToast()

  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [addingHabitId, setAddingHabitId] = useState<string | null>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const notifications = [
    { icon: '🌿', text: 'Tantangan "Tanpa Sedotan Plastik" tersisa 2 hari!', read: false },
    { icon: '🔥', text: 'Streak kamu mencapai 5 hari berturut-turut!', read: true },
    { icon: '🤖', text: 'Eco Coach memberikan saran baru di menu AI Coach.', read: true },
  ]

  // Fix Bug #3: Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: PointerEvent | MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!user) return
    habitService.getHabits(user.id).then(data => {
      setHabits(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const handleToggleHabit = async (id: string, done: boolean) => {
    if (!user) return

    const target = habits.find(h => h.id === id)
    if (!target) return

    // Optimistic UI update
    setHabits(prev => prev.map(h => h.id === id ? { ...h, done } : h))

    try {
      await habitService.toggleHabit(user.id, id, done)
      if (done) {
        await userService.addXP(user.id, target.xp)
        await refresh()
        showToast(`+${target.xp} XP! Habit "${target.title}" selesai 🎉`, 'success')
        // Navigate to completion celebration screen
        navigate(`/app/habit/${id}/complete`)
      } else {
        showToast(`Batal tandai "${target.title}"`, 'info')
      }
    } catch {
      // Rollback on error
      setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !done } : h))
      showToast('Gagal mengubah status habit', 'error')
    }
  }

  const allDone = habits.length > 0 && habits.every(h => h.done)
  const weekDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => ({ day, done: false }))
  const todayIndex = (new Date().getDay() + 6) % 7
  weekDays[todayIndex].done = habits.some(habit => habit.done)

  const handleAddHabit = async (templateId: string) => {
    if (!user || addingHabitId) return
    const template = MOCK_HABITS.find(habit => habit.id === templateId)
    if (!template) return

    setAddingHabitId(templateId)
    try {
      const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...habit } = template
      const createdHabit = await habitService.createHabit({ ...habit, user_id: user.id })
      setHabits(current => [...current, createdHabit])
      setShowAddHabit(false)
      showToast(`Habit "${createdHabit.title}" ditambahkan`, 'success')
    } catch {
      showToast('Habit belum dapat ditambahkan. Coba lagi.', 'error')
    } finally {
      setAddingHabitId(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ToastProvider toasts={toasts} />

      <div className="p-5 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-lime)] p-0.5 shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[var(--bg-card)] flex items-center justify-center">
                <Emoji size="2xl">🌿</Emoji>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black text-[var(--text-primary)] leading-tight">
                Halo, {user?.name || 'Eco Warrior'}! 👋
              </h1>
              <p className="text-xs font-bold text-[var(--accent-primary)]">
                Siap berdampak hari ini?
              </p>
            </div>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifikasi"
              className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--accent-muted)] transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl z-50 space-y-2 slide-up">
                <h4 className="text-xs font-black text-[var(--text-primary)] px-2 pb-1 border-b border-[var(--border-subtle)]">
                  Notifikasi Eco
                </h4>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl flex items-start gap-2.5 text-xs font-medium ${
                      n.read ? 'opacity-60 bg-[var(--bg-elevated)]' : 'bg-[var(--bg-secondary)] border border-[var(--border-subtle)] font-bold'
                    }`}
                  >
                    <Emoji size="md">{n.icon}</Emoji>
                    <p className="flex-1 text-[11px] text-[var(--text-primary)] leading-tight">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* User Level & XP Bar */}
        {user && (
          <XPBar
            level={user.level}
            levelName={user.level_name}
            xp={user.xp}
            xpToNext={user.xp_to_next_level}
          />
        )}

        {/* Stats & Streak Row */}
        <div className="flex items-center justify-between gap-3">
          <StreakBadge streak={user?.streak ?? 0} />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <CheckCircle className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-xs font-black text-[var(--text-primary)]">
              {habits.filter(h => h.done).length}/{habits.length} Selesai
            </span>
          </div>
        </div>

        {/* Weekly Dots Tracker */}
        <WeekDots days={weekDays} />

        {/* Eco Impact Grid */}
        <div className="space-y-2">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Dampak Hijaumu
          </h2>
          <EcoImpactGrid habits={habits} />
        </div>

        {/* Habit List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-[var(--text-primary)]">
              Habit Hari Ini 🌿
            </h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--accent-primary)] hover:underline"
            >
              <Plus className="size-3.5" /> Tambah
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <HabitCardSkeleton />
              <HabitCardSkeleton />
              <HabitCardSkeleton />
            </div>
          ) : habits.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center space-y-2">
              <Emoji size="3xl">🌱</Emoji>
              <h3 className="text-sm font-black text-[var(--text-primary)]">Belum Ada Habit</h3>
              <p className="text-xs text-[var(--text-muted)] font-semibold">
                Yuk pilih habit pertamamu untuk mulai mengumpulkan XP!
              </p>
            </div>
          ) : allDone ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border-default)] text-center space-y-2 slide-up">
              <Emoji size="4xl">🎉</Emoji>
              <h3 className="text-base font-black text-[var(--text-primary)]">Semua Selesai!</h3>
              <p className="text-xs text-[var(--text-muted)] font-bold">
                Kamu telah menyelesaikan semua habit hari ini. Luar biasa! 🌍
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {habits.map(habit => (
                <HabitCard key={habit.id} habit={habit} onToggle={handleToggleHabit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddHabit && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md mx-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-black text-[var(--text-primary)]">Tambah Habit</h2>
                <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Pilih kebiasaan yang ingin kamu lacak.</p>
              </div>
              <button onClick={() => setShowAddHabit(false)} aria-label="Tutup" className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-2">
              {MOCK_HABITS.map(template => {
                const alreadyAdded = habits.some(habit => habit.title === template.title)
                return (
                  <button
                    key={template.id}
                    onClick={() => handleAddHabit(template.id)}
                    disabled={alreadyAdded || addingHabitId !== null}
                    className="w-full flex items-center gap-3 rounded-2xl border border-[var(--border-default)] p-3 text-left transition-colors hover:border-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Emoji size="xl">{template.icon}</Emoji>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-[var(--text-primary)]">{template.title}</p>
                      <p className="text-xs font-semibold text-[var(--accent-primary)]">+{template.xp} XP per hari</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--accent-primary)]">{alreadyAdded ? 'Ditambahkan' : addingHabitId === template.id ? 'Menyimpan...' : 'Tambah'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
