import { supabase } from '../lib/supabase'

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  completed_on: string
  created_at: string
}

export const dateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeek() {
  const date = new Date()
  const day = date.getDay()
  date.setDate(date.getDate() - ((day + 6) % 7))
  date.setHours(0, 0, 0, 0)
  return date
}

export const progressService = {
  async recordCompletion(userId: string, habitId: string) {
    const { error } = await supabase.from('habit_logs').upsert({ user_id: userId, habit_id: habitId, completed_on: dateKey(new Date()) }, { onConflict: 'user_id,habit_id,completed_on' })
    if (error) throw error
  },
  async removeTodayCompletion(userId: string, habitId: string) {
    const { error } = await supabase.from('habit_logs').delete().eq('user_id', userId).eq('habit_id', habitId).eq('completed_on', dateKey(new Date()))
    if (error) throw error
  },
  async getThisWeek(userId: string): Promise<HabitLog[]> {
    const { data, error } = await supabase.from('habit_logs').select('*').eq('user_id', userId).gte('completed_on', dateKey(startOfWeek())).order('completed_on', { ascending: true })
    if (error) throw error
    return (data || []) as HabitLog[]
  },
  async getAll(userId: string): Promise<HabitLog[]> {
    const { data, error } = await supabase.from('habit_logs').select('*').eq('user_id', userId).order('completed_on', { ascending: false })
    if (error) throw error
    return (data || []) as HabitLog[]
  },
}
