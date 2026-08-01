import React from 'react'
import type { Achievement } from '../../types'
import { Emoji } from './Emoji'
import { Lock } from 'lucide-react'

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div
      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
        achievement.unlocked
          ? 'bg-[var(--bg-card)] border-[var(--border-default)] shadow-xs'
          : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] opacity-50'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          achievement.unlocked
            ? 'bg-[var(--accent-muted)]'
            : 'bg-[var(--bg-secondary)] border border-[var(--border-default)]'
        }`}
      >
        <Emoji size="2xl">{achievement.icon}</Emoji>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold text-sm text-[var(--text-primary)] truncate">
          {achievement.title}
        </h4>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 truncate">
          {achievement.desc}
        </p>
      </div>

      <div>
        {achievement.unlocked ? (
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)]">
            Tercapai
          </span>
        ) : (
          <div className="w-7 h-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)]">
            <Lock className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </div>
  )
}
