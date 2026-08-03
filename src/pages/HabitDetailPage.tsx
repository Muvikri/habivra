import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { habitService } from '../services/habitService'
import { userService } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'
import type { Habit } from '../types'
import { PageHeader } from '../components/layout/PageHeader'
import { Emoji } from '../components/shared/Emoji'
import { CheckCircle2, Flame, Award, Trash2 } from 'lucide-react'
import { useToast } from '../hooks/useToast'
import { ToastProvider } from '../components/shared/ToastProvider'

export function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const { toasts, show: showToast } = useToast()

  const [habit, setHabit] = useState<Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfirmDone, setShowConfirmDone] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    habitService.getHabitById(user.id, id).then(data => {
      setHabit(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, user])

  const handleToggleDone = async () => {
    if (!habit || !user) return

    // Fix Bug #8: If habit is already done, confirm before un-doing
    if (habit.done && !showConfirmDone) {
      setShowConfirmDone(true)
      return
    }

    const newDoneState = !habit.done
    try {
      if (!user) return
      const updated = await habitService.toggleHabit(user.id, habit.id, newDoneState)
      setHabit(updated)
      setShowConfirmDone(false)

      if (newDoneState) {
        await userService.addXP(user.id, habit.xp)
        showToast(`+${habit.xp} XP! Selesai! 🎉`, 'success')
        navigate(`/app/habit/${habit.id}/complete`)
      } else {
        showToast(`Habit ditandai belum selesai`, 'info')
      }
      await refresh()
    } catch {
      showToast('Gagal memperbarui habit', 'error')
    }
  }

  const handleDelete = async () => {
    if (!habit) return
    try {
      if (!user) return
      await habitService.deleteHabit(user.id, habit.id)
      showToast('Habit berhasil dihapus', 'info')
      navigate('/app/dashboard')
    } catch {
      showToast('Gagal menghapus habit', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-[var(--text-muted)]">Memuat detail habit...</p>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-4">
        <Emoji size="3xl">❓</Emoji>
        <p className="text-sm font-black text-[var(--text-primary)]">Habit tidak ditemukan</p>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <ToastProvider toasts={toasts} />

      <div>
        <PageHeader title="Detail Habit" showBack backPath="/app/dashboard" />

        <div className="mt-6 space-y-6">
          {/* Main Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border-default)] shadow-sm text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-elevated)] border-2 border-[var(--border-default)] flex items-center justify-center mx-auto shadow-md">
              <Emoji size="4xl">{habit.icon}</Emoji>
            </div>

            <h2 className="text-xl font-black text-[var(--text-primary)]">{habit.title}</h2>

            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                +{habit.xp} XP per hari
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {habit.streak_count} Hari Streak
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Deskripsi
            </h3>
            <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              {habit.desc || 'Habit ini membantu mengurangi jejak karbon harianmu.'}
            </p>
          </div>

          {/* Benefits */}
          {habit.benefits && habit.benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Manfaat Lingkungan
              </h3>
              <div className="space-y-2">
                {habit.benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact */}
          {habit.impact && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-[var(--border-default)] flex items-center gap-3">
              <Award className="w-6 h-6 text-[var(--accent-primary)] shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-[var(--text-muted)]">Estimasi Dampak</p>
                <p className="text-xs font-black text-[var(--text-primary)]">{habit.impact}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal before un-toggling done habit */}
      {showConfirmDone && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl text-center space-y-4 slide-up">
            <Emoji size="3xl">⚠️</Emoji>
            <h3 className="text-sm font-black text-[var(--text-primary)]">Tandai Belum Selesai?</h3>
            <p className="text-xs text-[var(--text-muted)] font-semibold">
              Kamu sudah menyelesaikan habit ini hari ini. Ingin membatalkan status selesai?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmDone(false)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)]"
              >
                Batal
              </button>
              <button
                onClick={handleToggleDone}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-6 pb-4 space-y-2">
        <button
          onClick={handleToggleDone}
          className={`w-full py-4 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            habit.done
              ? 'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)]'
              : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {habit.done ? 'Sudah Selesai (Klik untuk Ubah)' : 'Selesaikan Sekarang! (+ ' + habit.xp + ' XP)'}
        </button>

        <button
          onClick={handleDelete}
          className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Hapus Habit Ini
        </button>
      </div>
    </div>
  )
}
