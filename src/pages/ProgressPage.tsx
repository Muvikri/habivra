import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { StatCard } from '../components/shared/StatCard'
import { AchievementCard } from '../components/shared/AchievementCard'
import { BottomNav } from '../components/layout/BottomNav'
import { ProgressChartSkeleton } from '../components/shared/Skeletons'
import { useAuth } from '../contexts/AuthContext'
import { habitService } from '../services/habitService'
import { progressService, type HabitLog } from '../services/progressService'
import type { Habit } from '../types'

const weekLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export function ProgressPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [allLogs, setAllLogs] = useState<HabitLog[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([habitService.getHabits(user.id), progressService.getThisWeek(user.id), progressService.getAll(user.id)])
      .then(([habitData, logData, history]) => { setHabits(habitData); setLogs(logData); setAllLogs(history) })
      .finally(() => setLoading(false))
  }, [user])

  const barData = useMemo(() => {
    const monday = new Date()
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const activeHabitCount = Math.max(habits.length, 1)
    return weekLabels.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const count = logs.filter(log => log.completed_on === key).length
      return { day, count, val: Math.min(100, Math.round((count / activeHabitCount) * 100)) }
    })
  }, [habits.length, logs])

  const completedThisWeek = logs.length
  const average = Math.round(barData.reduce((total, bar) => total + bar.val, 0) / 7)
  const completedTotal = Math.max(user?.total_habits_done || 0, allLogs.length)
  const currentStreak = user?.streak ?? 0
  const achievements = [
    { icon: '🌱', title: 'Eco Beginner', desc: 'Selesaikan 10 habit', unlocked: completedTotal >= 10 },
    { icon: '🌿', title: 'Green Starter', desc: 'Streak 7 hari', unlocked: currentStreak >= 7 },
    { icon: '🌳', title: 'Green Hero', desc: 'Selesaikan 50 habit', unlocked: completedTotal >= 50 },
    { icon: '🌲', title: 'Forest Guardian', desc: 'Streak 30 hari', unlocked: currentStreak >= 30 },
    { icon: '🌎', title: 'Earth Protector', desc: 'Streak 100 hari', unlocked: currentStreak >= 100 },
  ]

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="p-5 space-y-5">
        <PageHeader title="Progress & Analisis" subtitle="Pantau perkembangan habit dan dampak lingkunganmu" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🔥" title="Streak Saat Ini" value={`${currentStreak} Hari`} subtitle="Dihitung dari riwayat aktivitas" />
          <StatCard icon="🌱" title="Habit Selesai" value={completedTotal} subtitle={`+${completedThisWeek} minggu ini`} />
        </div>
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Aktivitas Mingguan</h3>
            <span className="text-xs font-bold text-[var(--accent-primary)]">Rata-rata {average}%</span>
          </div>
          {loading ? <ProgressChartSkeleton /> : (
            <div className="flex items-end justify-between h-36 pt-4 px-2">
              {barData.map(bar => (
                <div key={bar.day} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-7 bg-[var(--border-subtle)] rounded-xl h-full flex items-end p-0.5 overflow-hidden">
                    <div className="w-full bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-lime)] rounded-lg chart-bar-grow" style={{ height: `${bar.val}%` }} />
                  </div>
                  <span className="text-[10px] font-extrabold text-[var(--text-muted)]">{bar.day}</span>
                </div>
              ))}
            </div>
          )}
          {!loading && habits.length === 0 && <p className="text-center text-xs font-semibold text-[var(--text-muted)]">Tambahkan habit untuk mulai melihat progres.</p>}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Pencapaian & Badge</h3>
            <span className="text-xs font-bold text-[var(--text-muted)]">{achievements.filter(item => item.unlocked).length}/{achievements.length}</span>
          </div>
          <div className="space-y-2.5">{achievements.map(achievement => <AchievementCard key={achievement.title} achievement={achievement} />)}</div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
