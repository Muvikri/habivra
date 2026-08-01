import { supabase } from '../lib/supabase'
import { MOCK_CHALLENGES } from '../constants/mockData'
import type { Challenge } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let localChallenges = [...MOCK_CHALLENGES]

export interface IChallengeService {
  getChallenges(userId: string): Promise<Challenge[]>
  joinChallenge(id: string): Promise<Challenge>
  updateProgress(id: string, progress: number): Promise<Challenge>
}

class SupabaseChallengeService implements IChallengeService {
  async getChallenges(userId: string): Promise<Challenge[]> {
    if (USE_MOCK) return localChallenges
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error || !data || data.length === 0) return localChallenges
    return data as Challenge[]
  }

  async joinChallenge(id: string): Promise<Challenge> {
    if (USE_MOCK) {
      localChallenges = localChallenges.map(c => c.id === id ? { ...c, joined: true } : c)
      return localChallenges.find(c => c.id === id)!
    }
    const { data, error } = await supabase
      .from('challenges')
      .update({ joined: true })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      localChallenges = localChallenges.map(c => c.id === id ? { ...c, joined: true } : c)
      return localChallenges.find(c => c.id === id)!
    }
    return data as Challenge
  }

  async updateProgress(id: string, progress: number): Promise<Challenge> {
    const done = progress >= 100
    if (USE_MOCK) {
      localChallenges = localChallenges.map(c => c.id === id ? { ...c, progress, done } : c)
      return localChallenges.find(c => c.id === id)!
    }
    const { data, error } = await supabase
      .from('challenges')
      .update({ progress, done })
      .eq('id', id)
      .select()
      .single()
    if (error) {
      localChallenges = localChallenges.map(c => c.id === id ? { ...c, progress, done } : c)
      return localChallenges.find(c => c.id === id)!
    }
    return data as Challenge
  }
}

export const challengeService: IChallengeService = new SupabaseChallengeService()
