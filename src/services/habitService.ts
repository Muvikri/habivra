import { supabase } from '../lib/supabase'
import { MOCK_HABITS } from '../constants/mockData'
import type { Habit } from '../types'
import { offlineStore } from './offlineStore'
import { dateKey, progressService } from './progressService'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let localHabits = [...MOCK_HABITS]
const isOnline = () => typeof navigator === 'undefined' || navigator.onLine

export interface IHabitService {
  getHabits(userId: string): Promise<Habit[]>
  getHabitById(id: string): Promise<Habit | null>
  toggleHabit(userId: string, id: string, done: boolean): Promise<Habit>
  createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit>
  deleteHabit(userId: string, id: string): Promise<void>
}

class SupabaseHabitService implements IHabitService {
  async getHabits(userId: string): Promise<Habit[]> {
    if (USE_MOCK) return localHabits
    if (!isOnline()) return offlineStore.getHabits(userId)
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) return offlineStore.getHabits(userId)
    const habits = (data || []) as Habit[]
    await offlineStore.setHabits(userId, habits)
    return habits
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

  async toggleHabit(userId: string, id: string, done: boolean): Promise<Habit> {
    if (USE_MOCK) {
      localHabits = localHabits.map(h => h.id === id ? { ...h, done, streak_count: done ? h.streak_count + 1 : Math.max(0, h.streak_count - 1) } : h)
      return localHabits.find(h => h.id === id)!
    }
    const cached = await offlineStore.getHabits(userId)
    const localHabit = cached.find(habit => habit.id === id)
    if (!localHabit) throw new Error('Habit tidak ditemukan.')
    const localUpdated = { ...localHabit, done }
    await offlineStore.setHabits(userId, cached.map(habit => habit.id === id ? localUpdated : habit))
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'habit.toggle', id, done, completedOn: dateKey(new Date()) })
      return localUpdated
    }
    const { data, error } = await supabase
      .from('habits')
      .update({ done, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      await offlineStore.enqueue(userId, { type: 'habit.toggle', id, done, completedOn: dateKey(new Date()) })
      return localUpdated
    }
    if (done) {
      await progressService.recordCompletion(userId, id)
    } else {
      await progressService.removeTodayCompletion(userId, id)
    }
    return data as Habit
  }

  async createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    if (USE_MOCK) {
      const newHabit: Habit = { ...habit, id: `h-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      localHabits.push(newHabit)
      return newHabit
    }

    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const cached = await offlineStore.getHabits(habit.user_id)
    await offlineStore.setHabits(habit.user_id, [...cached, newHabit])
    if (!isOnline()) {
      await offlineStore.enqueue(habit.user_id, { type: 'habit.create', habit: newHabit })
      return newHabit
    }

    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single()
    if (error) {
      await offlineStore.enqueue(habit.user_id, { type: 'habit.create', habit: newHabit })
      return newHabit
    }
    const synced = data as Habit
    await offlineStore.setHabits(habit.user_id, [...cached, synced])
    return synced
  }

  async deleteHabit(userId: string, id: string): Promise<void> {
    if (USE_MOCK) {
      localHabits = localHabits.filter(h => h.id !== id)
      return
    }
    const cached = await offlineStore.getHabits(userId)
    await offlineStore.setHabits(userId, cached.filter(habit => habit.id !== id))
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'habit.delete', id })
      return
    }
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) await offlineStore.enqueue(userId, { type: 'habit.delete', id })
  }
}

export const habitService: IHabitService = new SupabaseHabitService()
