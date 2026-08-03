import { supabase } from "../lib/supabase"
import { MOCK_HABITS } from "../constants/mockData"
import type { Habit } from "../types"
import { offlineStore } from "./offlineStore"
import { dateKey, progressService, type HabitLog } from "./progressService"

const USE_MOCK =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("placeholder")

let localHabits = [...MOCK_HABITS]
let localHabitLogs: HabitLog[] = MOCK_HABITS.filter((habit) => habit.done).map(
  (habit) => ({
    id: `mock-log-${habit.id}`,
    user_id: habit.user_id,
    habit_id: habit.id,
    completed_on: dateKey(new Date()),
    created_at: new Date().toISOString(),
  }),
)
const isOnline = () => typeof navigator === "undefined" || navigator.onLine

function createLocalHabitId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID()
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function applyTodayCompletionState(habits: Habit[], logs: HabitLog[]) {
  const completedIds = new Set(logs.map((log) => log.habit_id))
  return habits.map((habit) => ({ ...habit, done: completedIds.has(habit.id) }))
}

export interface IHabitService {
  getHabits(userId: string): Promise<Habit[]>
  getHabitById(userId: string, id: string): Promise<Habit | null>
  toggleHabit(userId: string, id: string, done: boolean): Promise<Habit>
  createHabit(
    habit: Omit<Habit, "id" | "created_at" | "updated_at">,
  ): Promise<Habit>
  deleteHabit(userId: string, id: string): Promise<void>
}

class SupabaseHabitService implements IHabitService {
  async getHabits(userId: string): Promise<Habit[]> {
    if (USE_MOCK)
      return applyTodayCompletionState(
        localHabits,
        localHabitLogs.filter(
          (log) => log.completed_on === dateKey(new Date()),
        ),
      )
    if (!isOnline()) {
      const [habits, logs] = await Promise.all([
        offlineStore.getHabits(userId),
        offlineStore.getHabitLogs(userId),
      ])
      return applyTodayCompletionState(
        habits,
        logs.filter((log) => log.completed_on === dateKey(new Date())),
      )
    }
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
    if (error) {
      const [cachedHabits, cachedLogs] = await Promise.all([
        offlineStore.getHabits(userId),
        offlineStore.getHabitLogs(userId),
      ])
      return applyTodayCompletionState(
        cachedHabits,
        cachedLogs.filter((log) => log.completed_on === dateKey(new Date())),
      )
    }
    const habits = (data || []) as Habit[]
    await offlineStore.setHabits(userId, habits)
    try {
      const logs = await progressService.getToday(userId)
      await offlineStore.setHabitLogs(userId, logs)
      return applyTodayCompletionState(habits, logs)
    } catch {
      const cachedLogs = await offlineStore.getHabitLogs(userId)
      return applyTodayCompletionState(
        habits,
        cachedLogs.filter((log) => log.completed_on === dateKey(new Date())),
      )
    }
  }

  async getHabitById(userId: string, id: string): Promise<Habit | null> {
    if (USE_MOCK) {
      return (
        applyTodayCompletionState(
          localHabits,
          localHabitLogs.filter(
            (log) => log.completed_on === dateKey(new Date()),
          ),
        ).find((habit) => habit.id === id) || null
      )
    }
    if (!isOnline()) {
      const [habits, logs] = await Promise.all([
        offlineStore.getHabits(userId),
        offlineStore.getHabitLogs(userId),
      ])
      return (
        applyTodayCompletionState(
          habits,
          logs.filter((log) => log.completed_on === dateKey(new Date())),
        ).find((habit) => habit.id === id) || null
      )
    }
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single()
    if (error || !data) return null
    const habit = data as Habit
    try {
      const logs = await progressService.getToday(userId)
      await offlineStore.setHabitLogs(userId, logs)
      return applyTodayCompletionState([habit], logs)[0]
    } catch {
      const logs = await offlineStore.getHabitLogs(userId)
      return applyTodayCompletionState(
        [habit],
        logs.filter((log) => log.completed_on === dateKey(new Date())),
      )[0]
    }
  }

  async toggleHabit(userId: string, id: string, done: boolean): Promise<Habit> {
    if (USE_MOCK) {
      localHabits = localHabits.map((h) =>
        h.id === id
          ? {
              ...h,
              done,
              streak_count: done
                ? h.streak_count + 1
                : Math.max(0, h.streak_count - 1),
            }
          : h,
      )
      localHabitLogs = done
        ? [
            ...localHabitLogs.filter(
              (log) =>
                log.habit_id !== id || log.completed_on !== dateKey(new Date()),
            ),
            {
              id: `mock-log-${id}-${dateKey(new Date())}`,
              user_id: userId,
              habit_id: id,
              completed_on: dateKey(new Date()),
              created_at: new Date().toISOString(),
            },
          ]
        : localHabitLogs.filter(
            (log) =>
              log.habit_id !== id || log.completed_on !== dateKey(new Date()),
          )
      return applyTodayCompletionState(
        localHabits,
        localHabitLogs.filter(
          (log) => log.completed_on === dateKey(new Date()),
        ),
      ).find((habit) => habit.id === id)!
    }
    let cached = await offlineStore.getHabits(userId)
    let localHabit = cached.find((habit) => habit.id === id)
    if (!localHabit) {
      localHabit = await this.getHabitById(userId, id)
      if (localHabit) {
        cached = [...cached, localHabit]
        await offlineStore.setHabits(userId, cached)
      }
    }
    if (!localHabit) throw new Error("Habit tidak ditemukan.")
    const localUpdated = { ...localHabit, done }
    await offlineStore.setHabits(
      userId,
      cached.map((habit) => (habit.id === id ? localUpdated : habit)),
    )
    const cachedLogs = await offlineStore.getHabitLogs(userId)
    const today = dateKey(new Date())
    const nextLogs = done
      ? [
          ...cachedLogs.filter(
            (log) => log.habit_id !== id || log.completed_on !== today,
          ),
          {
            id: `local-${id}-${today}`,
            user_id: userId,
            habit_id: id,
            completed_on: today,
            created_at: new Date().toISOString(),
          },
        ]
      : cachedLogs.filter(
          (log) => log.habit_id !== id || log.completed_on !== today,
        )
    await offlineStore.setHabitLogs(userId, nextLogs)
    if (!isOnline()) {
      await offlineStore.enqueue(userId, {
        type: "habit.toggle",
        id,
        done,
        completedOn: dateKey(new Date()),
      })
      return localUpdated
    }
    const { data, error } = await supabase
      .from("habits")
      .update({ done, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()
    if (error) {
      await offlineStore.enqueue(userId, {
        type: "habit.toggle",
        id,
        done,
        completedOn: dateKey(new Date()),
      })
      return localUpdated
    }
    if (done) {
      await progressService.recordCompletion(userId, id)
    } else {
      await progressService.removeTodayCompletion(userId, id)
    }
    return data as Habit
  }

  async createHabit(
    habit: Omit<Habit, "id" | "created_at" | "updated_at">,
  ): Promise<Habit> {
    if (USE_MOCK) {
      const newHabit: Habit = {
        ...habit,
        id: `h-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      localHabits.push(newHabit)
      return newHabit
    }

    const newHabit: Habit = {
      ...habit,
      id: createLocalHabitId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const cached = await offlineStore.getHabits(habit.user_id)
    await offlineStore.setHabits(habit.user_id, [...cached, newHabit])
    if (!isOnline()) {
      await offlineStore.enqueue(habit.user_id, {
        type: "habit.create",
        habit: newHabit,
      })
      return newHabit
    }

    const { data, error } = await supabase
      .from("habits")
      .insert(habit)
      .select()
      .single()
    if (error) {
      await offlineStore.enqueue(habit.user_id, {
        type: "habit.create",
        habit: newHabit,
      })
      return newHabit
    }
    const synced = data as Habit
    await offlineStore.setHabits(habit.user_id, [...cached, synced])
    return synced
  }

  async deleteHabit(userId: string, id: string): Promise<void> {
    if (USE_MOCK) {
      localHabits = localHabits.filter((h) => h.id !== id)
      return
    }
    const cached = await offlineStore.getHabits(userId)
    await offlineStore.setHabits(
      userId,
      cached.filter((habit) => habit.id !== id),
    )
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: "habit.delete", id })
      return
    }
    const { error } = await supabase.from("habits").delete().eq("id", id)
    if (error) await offlineStore.enqueue(userId, { type: "habit.delete", id })
  }
}

export const habitService: IHabitService = new SupabaseHabitService()
