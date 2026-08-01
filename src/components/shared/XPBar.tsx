import React from 'react'
import { calculateLevelProgress } from '../../lib/utils'

interface XPBarProps {
  level: number
  levelName: string
  xp: number
  xpToNext: number
}

export function XPBar({ level, levelName, xp, xpToNext }: XPBarProps) {
  const percentage = calculateLevelProgress(xp, xpToNext)

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-card)] border border-[var(--border-default)] shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-black flex items-center justify-center shadow-md">
            L{level}
          </span>
          <span className="font-extrabold text-sm text-[var(--text-primary)]">
            {levelName}
          </span>
        </div>
        <span className="text-xs font-bold text-[var(--accent-primary)]">
          {xp} / {xpToNext} XP
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress XP Level"
        className="w-full h-3 rounded-full bg-[var(--border-subtle)] overflow-hidden p-0.5"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-lime)] transition-all duration-500 bar-grow"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
