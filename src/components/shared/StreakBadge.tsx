import React from 'react'
import { Emoji } from './Emoji'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-xs">
      <Emoji size="md">🔥</Emoji>
      <span className="text-xs font-black text-[var(--accent-primary)]">
        {streak} Hari Streak
      </span>
    </div>
  )
}
