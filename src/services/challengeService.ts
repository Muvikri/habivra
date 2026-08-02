import { supabase } from '../lib/supabase'
import { MOCK_CHALLENGES } from '../constants/mockData'
import type { Challenge } from '../types'
import { offlineStore } from './offlineStore'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
const isOnline = () => typeof navigator === 'undefined' || navigator.onLine

function defaultsFor(userId: string) {
  return MOCK_CHALLENGES.map(({ id: _id, created_at: _createdAt, ...challenge }) => ({ ...challenge, user_id: userId }))
}

export interface IChallengeService {
  getChallenges(userId: string): Promise<Challenge[]>
  joinChallenge(userId: string, id: string): Promise<Challenge>
  updateProgress(userId: string, id: string, progress: number): Promise<Challenge>
}

class SupabaseChallengeService implements IChallengeService {
  async getChallenges(userId: string): Promise<Challenge[]> {
    if (USE_MOCK) return defaultsFor(userId) as Challenge[]
    if (!isOnline()) return offlineStore.getChallenges(userId)

    const { data, error } = await supabase.from('challenges').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) return offlineStore.getChallenges(userId)

    let challenges = (data || []) as Challenge[]
    if (challenges.length === 0) {
      const { data: seeded, error: seedError } = await supabase.from('challenges').insert(defaultsFor(userId)).select()
      if (seedError) return offlineStore.getChallenges(userId)
      challenges = (seeded || []) as Challenge[]
    }
    await offlineStore.setChallenges(userId, challenges)
    return challenges
  }

  async joinChallenge(userId: string, id: string): Promise<Challenge> {
    const cached = await offlineStore.getChallenges(userId)
    const current = cached.find(challenge => challenge.id === id)
    if (!current) throw new Error('Tantangan tidak ditemukan.')
    const updated = { ...current, joined: true }
    const next = cached.map(challenge => challenge.id === id ? updated : challenge)
    await offlineStore.setChallenges(userId, next)
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'challenge.join', id })
      return updated
    }
    const { data, error } = await supabase.from('challenges').update({ joined: true }).eq('id', id).select().single()
    if (error) {
      await offlineStore.enqueue(userId, { type: 'challenge.join', id })
      return updated
    }
    const synced = data as Challenge
    await offlineStore.setChallenges(userId, next.map(challenge => challenge.id === id ? synced : challenge))
    return synced
  }

  async updateProgress(userId: string, id: string, progress: number): Promise<Challenge> {
    const cached = await offlineStore.getChallenges(userId)
    const current = cached.find(challenge => challenge.id === id)
    if (!current) throw new Error('Tantangan tidak ditemukan.')
    const updated = { ...current, progress, done: progress >= 100 }
    const next = cached.map(challenge => challenge.id === id ? updated : challenge)
    await offlineStore.setChallenges(userId, next)
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'challenge.progress', id, progress })
      return updated
    }
    const { data, error } = await supabase.from('challenges').update({ progress, done: progress >= 100 }).eq('id', id).select().single()
    if (error) {
      await offlineStore.enqueue(userId, { type: 'challenge.progress', id, progress })
      return updated
    }
    return data as Challenge
  }
}

export const challengeService: IChallengeService = new SupabaseChallengeService()
