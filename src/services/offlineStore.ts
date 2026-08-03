import { Preferences } from '@capacitor/preferences'
import type { Challenge, Habit } from '../types'
import type { HabitLog } from './progressService'

type QueueOperation =
  | { type: 'habit.create'; habit: Habit }
  | { type: 'habit.toggle'; id: string; done: boolean; completedOn: string }
  | { type: 'habit.delete'; id: string }
  | { type: 'challenge.join'; id: string }
  | { type: 'challenge.progress'; id: string; progress: number }

const key = (name: string, userId: string) => `habivra:${name}:${userId}`

async function read<T>(storageKey: string, fallback: T): Promise<T> {
  const { value } = await Preferences.get({ key: storageKey })
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

async function write<T>(storageKey: string, value: T) {
  await Preferences.set({ key: storageKey, value: JSON.stringify(value) })
}

export const offlineStore = {
  getHabits: (userId: string) => read<Habit[]>(key('habits', userId), []),
  setHabits: (userId: string, habits: Habit[]) => write(key('habits', userId), habits),
  getHabitLogs: (userId: string) => read<HabitLog[]>(key('habit-logs', userId), []),
  setHabitLogs: (userId: string, logs: HabitLog[]) => write(key('habit-logs', userId), logs),
  getChallenges: (userId: string) => read<Challenge[]>(key('community-challenges', userId), []),
  setChallenges: (userId: string, challenges: Challenge[]) => write(key('community-challenges', userId), challenges),
  getQueue: (userId: string) => read<QueueOperation[]>(key('queue', userId), []),
  async enqueue(userId: string, operation: QueueOperation) {
    const queue = await this.getQueue(userId)
    await write(key('queue', userId), [...queue, operation])
  },
  setQueue: (userId: string, queue: QueueOperation[]) => write(key('queue', userId), queue),
}

export type { QueueOperation }
