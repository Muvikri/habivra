import React from 'react'
import { Emoji } from './Emoji'

interface StatCardProps {
  icon: string
  title: string
  value: string | number
  subtitle?: string
}

export function StatCard({ icon, title, value, subtitle }: StatCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-xs flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
        <Emoji size="xl">{icon}</Emoji>
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)]">{title}</p>
        <p className="text-lg font-black text-[var(--text-primary)] leading-tight">{value}</p>
        {subtitle && <p className="text-[10px] text-[var(--accent-primary)] font-bold mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
