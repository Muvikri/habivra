import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Habit } from '../../types'
import { Emoji } from './Emoji'
import { Check } from 'lucide-react'

interface HabitCardProps {
  habit: Habit
  onToggle: (id: string, done: boolean) => void
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/app/habit/${habit.id}`)}
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        habit.done
          ? 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-85'
          : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[var(--accent-primary)] shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
            habit.done
              ? 'bg-[var(--accent-muted)]'
              : 'bg-[var(--bg-secondary)] border border-[var(--border-default)]'
          }`}
        >
          <Emoji size="xl">{habit.icon}</Emoji>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-sm truncate ${
              habit.done
                ? 'line-through text-[var(--text-muted)]'
                : 'text-[var(--text-primary)]'
            }`}
          >
            {habit.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]">
              +{habit.xp} XP
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)] truncate">
              🔥 {habit.streak_count} hari
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={habit.done}
        aria-label={`Tandai ${habit.title} selesai`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(habit.id, !habit.done)
        }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${
          habit.done
            ? 'bg-[var(--accent-primary)] text-white shadow-md scale-100'
            : 'bg-[var(--bg-elevated)] border-2 border-[var(--border-default)] hover:border-[var(--accent-primary)] text-transparent'
        }`}
      >
        <Check className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  )
}
