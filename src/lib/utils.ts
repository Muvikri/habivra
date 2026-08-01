import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatXP(xp: number): string {
  return `${xp} XP`
}

export function calculateLevelProgress(xp: number, xpToNext: number): number {
  if (!xpToNext || xpToNext === 0) return 0
  return Math.min(Math.round((xp / xpToNext) * 100), 100)
}
