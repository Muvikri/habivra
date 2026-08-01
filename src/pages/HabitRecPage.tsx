import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { MOCK_HABITS } from '../constants/mockData'
import { Emoji } from '../components/shared/Emoji'
import { habitService } from '../services/habitService'
import { userService } from '../services/userService'
import { useAuth } from '../contexts/AuthContext'

export function HabitRecPage() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(
    MOCK_HABITS.slice(0, 3).map(h => h.id)
  )

  const toggleSelect = (id: string) => {
    if (selectedHabitIds.includes(id)) {
      setSelectedHabitIds(selectedHabitIds.filter(hId => hId !== id))
    } else {
      setSelectedHabitIds([...selectedHabitIds, id])
    }
  }

  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFinish = async () => {
    if (!user || saving) return
    setSaving(true)
    setErrorMessage('')

    try {
      const selectedHabits = MOCK_HABITS.filter(habit => selectedHabitIds.includes(habit.id))
      await Promise.all(selectedHabits.map(({ id: _id, created_at: _createdAt, updated_at: _updatedAt, ...habit }) =>
        habitService.createHabit({ ...habit, user_id: user.id })
      ))
      await userService.updateProfile(user.id, { onboarding_completed: true })
      await refresh()
      navigate('/app/dashboard', { replace: true })
    } catch {
      setErrorMessage('Habit belum dapat disimpan. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <div>
        <PageHeader
          title="Rekomendasi Habit"
          subtitle="Pilih kebiasaan harian pertama yang ingin kamu mulai"
          showBack
          backPath="/setup/goals"
        />

        <div className="space-y-3 mt-6">
          {MOCK_HABITS.map(habit => {
            const isSelected = selectedHabitIds.includes(habit.id)
            return (
              <div
                key={habit.id}
                onClick={() => toggleSelect(habit.id)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--bg-card)] border-[var(--accent-primary)] shadow-sm'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-70'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-2">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                    <Emoji size="2xl">{habit.icon}</Emoji>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                      {habit.title}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--accent-primary)] mt-0.5">
                      +{habit.xp} XP per hari
                    </p>
                  </div>
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
              </div>
            )
          })}
        </div>
      </div>

      <div className="pb-4 pt-6">
        {errorMessage && <p className="mb-3 text-center text-xs font-bold text-red-500">{errorMessage}</p>}
        <button
          onClick={handleFinish}
          disabled={selectedHabitIds.length === 0 || saving}
          className={`w-full py-4 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 ${
            selectedHabitIds.length === 0
              ? 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
          }`}
        >
          {saving ? 'Menyimpan...' : `Mulai Lacak ${selectedHabitIds.length} Habit`}
        </button>
      </div>
    </div>
  )
}
