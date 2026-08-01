import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { MOCK_GOALS } from '../constants/mockData'
import { Emoji } from '../components/shared/Emoji'

export function GoalSetupPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<number[]>([1])

  const toggleGoal = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(g => g !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <div>
        <PageHeader
          title="Pilih Tujuanmu"
          subtitle="Pilih satu atau lebih fokus kebiasaan hijau"
          showBack
          backPath="/onboarding"
        />

        <div className="space-y-3 mt-6">
          {MOCK_GOALS.map(goal => {
            const isSelected = selected.includes(goal.id)
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                  isSelected
                    ? 'bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-sm'
                    : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[var(--accent-muted)]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                    <Emoji size="xl">{goal.icon}</Emoji>
                  </div>
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">
                    {goal.label}
                  </span>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                      : 'border-[var(--border-default)] text-transparent'
                  }`}
                >
                  ✓
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pb-4 pt-6">
        <button
          onClick={() => navigate('/setup/habits')}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 ${
            selected.length === 0
              ? 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
          }`}
        >
          Lanjut ke Rekomendasi Habit
        </button>
      </div>
    </div>
  )
}
