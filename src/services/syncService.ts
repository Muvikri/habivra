import { App } from '@capacitor/app'
import { Network } from '@capacitor/network'
import { supabase } from '../lib/supabase'
import { offlineStore, type QueueOperation } from './offlineStore'
import { dateKey } from './progressService'

const isOnline = () => typeof navigator === 'undefined' || navigator.onLine
let subscribedUserId: string | null = null

async function refreshCaches(userId: string) {
  const habitsResult = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  if (!habitsResult.error && habitsResult.data) await offlineStore.setHabits(userId, habitsResult.data)
}

async function applyOperation(userId: string, operation: QueueOperation) {
  if (operation.type === 'habit.create') return supabase.from('habits').insert(operation.habit)
  if (operation.type === 'habit.toggle') {
    const result = await supabase.from('habits').update({ done: operation.done, updated_at: new Date().toISOString() }).eq('id', operation.id)
    if (result.error) return result
    if (operation.done) {
      return supabase.from('habit_logs').upsert(
        { user_id: userId, habit_id: operation.id, completed_on: operation.completedOn || dateKey(new Date()) },
        { onConflict: 'user_id,habit_id,completed_on' },
      )
    }
    return supabase.from('habit_logs').delete().eq('user_id', userId).eq('habit_id', operation.id).eq('completed_on', operation.completedOn || dateKey(new Date()))
  }
  if (operation.type === 'habit.delete') return supabase.from('habits').delete().eq('id', operation.id)
  if (operation.type === 'challenge.join') {
    return supabase.from('challenge_participants').upsert(
      { challenge_id: operation.id, user_id: userId, progress: 0, done: false },
      { onConflict: 'challenge_id,user_id', ignoreDuplicates: true },
    )
  }
  return supabase
    .from('challenge_participants')
    .update({ progress: operation.progress, done: operation.progress >= 100 })
    .eq('challenge_id', operation.id)
    .eq('user_id', userId)
}

export const syncService = {
  async flush(userId: string) {
    if (!isOnline()) return
    const queue = await offlineStore.getQueue(userId)
    const remaining: QueueOperation[] = []
    for (const operation of queue) {
      const { error } = await applyOperation(userId, operation)
      if (error) remaining.push(operation)
    }
    await offlineStore.setQueue(userId, remaining)
  },
  async start(userId: string) {
    await this.flush(userId)
    if (isOnline()) await refreshCaches(userId)
    if (subscribedUserId !== userId) {
      if (subscribedUserId) supabase.removeAllChannels()
      subscribedUserId = userId
      supabase.channel(`habivra-sync-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${userId}` }, () => { void refreshCaches(userId) })
        .subscribe()
    }
    window.addEventListener('online', () => { void this.flush(userId) })
    void Network.addListener('networkStatusChange', status => { if (status.connected) void this.flush(userId) })
    void App.addListener('appStateChange', state => { if (state.isActive) void this.flush(userId) })
  },
}
