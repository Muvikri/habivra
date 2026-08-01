import React from 'react'

export function HabitCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-[var(--border-subtle)] skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-[var(--border-subtle)] rounded-lg skeleton" />
          <div className="h-3 w-1/2 bg-[var(--border-subtle)] rounded-lg skeleton" />
        </div>
      </div>
      <div className="w-9 h-9 rounded-xl bg-[var(--border-subtle)] skeleton" />
    </div>
  )
}

export function ProgressChartSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4 animate-pulse">
      <div className="h-5 w-1/3 bg-[var(--border-subtle)] rounded-lg skeleton" />
      <div className="h-32 w-full bg-[var(--border-subtle)] rounded-2xl skeleton" />
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="w-3/4 h-12 rounded-2xl bg-[var(--border-subtle)] skeleton self-start" />
      <div className="w-2/3 h-10 rounded-2xl bg-[var(--border-subtle)] skeleton self-end ml-auto" />
      <div className="w-4/5 h-16 rounded-2xl bg-[var(--border-subtle)] skeleton self-start" />
    </div>
  )
}
