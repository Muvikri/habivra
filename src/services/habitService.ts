import { supabase } from '../lib/supabase'
import { MOCK_HABITS } from '../constants/mockData'
import type { Habit } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let localHabits = [...MOCK_HABITS]

export interface IHabitService {
  getHabits(userId: string): Promise<Habit[]>
  getHabitById(id: string): Promise<Habit | null>
  toggleHabit(id: string, done: boolean): Promise<Habit>
  createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit>
  deleteHabit(id: string): Promise<void>
}

class SupabaseHabitService implements IHabitService {
  async getHabits(userId: string): Promise<Habit[]> {
    if (USE_MOCK) return localHabits
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as Habit[]
  }

  async getHabitById(id: string): Promise<Habit | null> {
    if (USE_MOCK) {
      return localHabits.find(h => h.id === id) || null
    }
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as Habit
  }

  async toggleHabit(id: string, done: boolean): Promise<Habit> {
    if (USE_MOCK) {
      localHabits = localHabits.map(h => h.id === id ? { ...h, done, streak_count: done ? h.streak_count + 1 : Math.max(0, h.streak_count - 1) } : h)
      return localHabits.find(h => h.id === id)!
    }
    const { data, error } = await supabase
      .from('habits')
      .update({ done, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Habit
  }

  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    const newHabit: Habit = {
      ...habit,
      id: USE_MOCK ? `h-${Date.now()}` : habit.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (USE_MOCK) {
      localHabits.push(newHabit)
      return newHabit
    }

    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single()
    if (error) throw error
    return data as Habit
  }

  async deleteHabit(id: string): Promise<void> {
    if (USE_MOCK) {
      localHabits = localHabits.filter(h => h.id !== id)
      return
    }
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error
  }
}

export const habitService: IHabitService = new SupabaseHabitService()
