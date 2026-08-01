import React from 'react'
import type { Challenge } from '../../types'
import { Emoji } from './Emoji'

interface ChallengeCardProps {
  challenge: Challenge
  onJoin?: (id: string) => void
}

export function ChallengeCard({ challenge, onJoin }: ChallengeCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
            <Emoji size="xl">{challenge.icon}</Emoji>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              {challenge.title}
            </h3>
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {challenge.days} Hari • Hadiah: {challenge.reward}
            </span>
          </div>
        </div>
      </div>

      {challenge.joined ? (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[var(--text-muted)]">Progress</span>
            <span className="text-[var(--accent-primary)]">{challenge.progress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500"
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => onJoin && onJoin(challenge.id)}
          className="w-full py-2.5 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-bold hover:bg-[var(--accent-secondary)] transition-colors shadow-sm"
        >
          Ikuti Tantangan
        </button>
      )}
    </div>
  )
}
