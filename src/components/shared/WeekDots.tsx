import React from 'react'
import type { WeekDay } from '../../types'
import { Check } from 'lucide-react'

interface WeekDotsProps {
  days: WeekDay[]
}

export function WeekDots({ days }: WeekDotsProps) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      {days.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-extrabold text-[var(--text-muted)]">
            {item.day}
          </span>
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
              item.done
                ? 'bg-[var(--accent-primary)] text-white shadow-sm font-bold'
                : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-transparent'
            }`}
          >
            {item.done && <Check className="w-4 h-4 stroke-[3]" />}
          </div>
        </div>
      ))}
    </div>
  )
}
