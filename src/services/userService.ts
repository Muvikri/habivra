import { supabase } from '../lib/supabase'
import { MOCK_PROFILE } from '../constants/mockData'
import type { UserProfile } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let localProfile = { ...MOCK_PROFILE }

function createDefaultProfile(userId: string): UserProfile {
  return {
    id: userId,
    name: '',
    level: 1,
    level_name: 'Pemula Hijau',
    xp: 0,
    xp_to_next_level: 300,
    streak: 0,
    total_habits_done: 0,
    onboarding_completed: false,
    avatar_url: null,
    theme: 'system',
    reminder_enabled: true,
    language: 'id',
  }
}

export interface IUserService {
  getProfile(userId: string): Promise<UserProfile>
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>
  addXP(userId: string, xpGain: number): Promise<UserProfile>
}

class SupabaseUserService implements IUserService {
  async getProfile(userId: string): Promise<UserProfile> {
    if (USE_MOCK) return localProfile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return createDefaultProfile(userId)
    return data as UserProfile
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    localProfile = { ...localProfile, ...updates }
    if (USE_MOCK) return localProfile

    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error || !data) return { ...createDefaultProfile(userId), ...updates }
    return data as UserProfile
  }

  async addXP(userId: string, xpGain: number): Promise<UserProfile> {
    const profile = await this.getProfile(userId)
    const newXP = profile.xp + xpGain
    const leveledUp = newXP >= profile.xp_to_next_level
    const updates: Partial<UserProfile> = {
      xp: leveledUp ? newXP - profile.xp_to_next_level : newXP,
      level: leveledUp ? profile.level + 1 : profile.level,
      xp_to_next_level: leveledUp ? profile.xp_to_next_level + 100 : profile.xp_to_next_level,
      total_habits_done: profile.total_habits_done + 1,
    }
    return this.updateProfile(userId, updates)
  }
}

export const userService: IUserService = new SupabaseUserService()
