import { supabase } from '../lib/supabase'
import { MOCK_PROFILE } from '../constants/mockData'
import type { UserProfile } from '../types'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export interface IAuthService {
  loginWithGoogle(): Promise<void>
  loginWithEmail(email: string, password: string): Promise<UserProfile>
  loginAsGuest(): Promise<UserProfile>
  logout(): Promise<void>
  getSession(): Promise<UserProfile | null>
}

class SupabaseAuthService implements IAuthService {
  async loginWithGoogle(): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/dashboard` },
    })
    if (error) throw error
  }

  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    if (USE_MOCK) return MOCK_PROFILE
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return this._fetchProfile(data.user.id)
  }

  async loginAsGuest(): Promise<UserProfile> {
    if (USE_MOCK) return MOCK_PROFILE
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return this._fetchProfile(data.user.id)
  }

  async logout(): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getSession(): Promise<UserProfile | null> {
    if (USE_MOCK) return MOCK_PROFILE
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    return this._fetchProfile(session.user.id)
  }

  private async _fetchProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      // Fallback profile if not present yet
      return {
        ...MOCK_PROFILE,
        id: userId,
      }
    }
    return data as UserProfile
  }
}

export const authService: IAuthService = new SupabaseAuthService()
