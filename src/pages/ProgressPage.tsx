import { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { StatCard } from '../components/shared/StatCard'
import { AchievementCard } from '../components/shared/AchievementCard'
import { MOCK_ACHIEVEMENTS } from '../constants/mockData'
import { BottomNav } from '../components/layout/BottomNav'
import { ProgressChartSkeleton } from '../components/shared/Skeletons'

export function ProgressPage() {
  const [loading] = useState(false)

  const barData = [
    { day: 'Sen', val: 80 },
    { day: 'Sel', val: 100 },
    { day: 'Rab', val: 40 },
    { day: 'Kam', val: 90 },
    { day: 'Jum', val: 100 },
    { day: 'Sab', val: 75 },
    { day: 'Min', val: 60 },
  ]

  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="p-5 space-y-5">
        <PageHeader
          title="Progress & Analisis"
          subtitle="Pantau perkembangan habit dan dampak lingkunganmu"
        />

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🔥" title="Streak Saat Ini" value="5 Hari" subtitle="Terbaik: 12 Hari" />
          <StatCard icon="🌱" title="Total Habit" value="28 Selesai" subtitle="+4 Minggu Ini" />
        </div>

        {/* Weekly Chart */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Aktivitas Mingguan
            </h3>
            <span className="text-xs font-bold text-[var(--accent-primary)]">Rata-rata 82%</span>
          </div>

          {loading ? (
            <ProgressChartSkeleton />
          ) : (
            <div className="flex items-end justify-between h-36 pt-4 px-2">
              {barData.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-7 bg-[var(--border-subtle)] rounded-xl h-full flex items-end p-0.5 overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-[var(--accent-primary)] to-[var(--accent-lime)] rounded-lg chart-bar-grow"
                      style={{ height: `${b.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-[var(--text-muted)]">
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Pencapaian & Badge 🏆
            </h3>
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length}/{MOCK_ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {MOCK_ACHIEVEMENTS.map((ach, idx) => (
              <AchievementCard key={idx} achievement={ach} />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
