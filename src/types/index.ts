export interface Habit {
  id: string
  user_id: string
  icon: string
  title: string
  xp: number
  done: boolean
  desc: string
  benefits: string[]
  impact: string
  streak_days: boolean[]
  streak_count: number
  category?: string | null
  created_at?: string
  updated_at?: string
}

export interface Challenge {
  id: string
  user_id: string
  icon: string
  title: string
  days: number
  progress: number
  reward: string
  color: string
  done: boolean
  joined: boolean
  created_at?: string
}

export interface Goal {
  id: number
  icon: string
  label: string
}

export interface Achievement {
  icon: string
  title: string
  desc: string
  unlocked: boolean
}

export interface WeekDay {
  day: string
  done: boolean
}

export interface ChatMessage {
  id: string
  user_id: string
  from_role: 'user' | 'ai'
  text: string
  created_at: string
}

export interface AIInsight {
  id: number
  icon: string
  text: string
}

export interface UserProfile {
  id: string
  name: string
  level: number
  level_name: string
  xp: number
  xp_to_next_level: number
  streak: number
  total_habits_done: number
  onboarding_completed: boolean
  avatar_url?: string | null
  theme: 'light' | 'dark' | 'system'
  reminder_enabled: boolean
  reminder_hour: number
  reminder_minute: number
  language: string
}

export interface NotificationItem {
  icon: string
  text: string
  read: boolean
}

export type NavTab = 'dashboard' | 'progress' | 'challenge' | 'ai-coach' | 'profile'

export type Theme = 'light' | 'dark' | 'system'
