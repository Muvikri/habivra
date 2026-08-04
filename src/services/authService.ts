import { supabase } from "../lib/supabase"
import { MOCK_PROFILE } from "../constants/mockData"
import { userService } from "./userService"
import type { UserProfile } from "../types"

const USE_MOCK =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("placeholder")

export interface IAuthService {
  loginWithGoogle(): Promise<void>
  loginWithEmail(email: string, password: string): Promise<UserProfile>
  registerWithEmail(
    displayName: string,
    email: string,
    password: string,
  ): Promise<UserProfile>
  upgradeGuestAccount(email: string, password: string): Promise<void>
  loginAsGuest(): Promise<UserProfile>
  logout(): Promise<void>
  getSession(): Promise<UserProfile | null>
}

class SupabaseAuthService implements IAuthService {
  async loginWithGoogle(): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app/dashboard` },
    })
    if (error) throw error
  }

  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    if (USE_MOCK) return MOCK_PROFILE
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return this._fetchProfile(data.user.id)
  }

  async registerWithEmail(
    displayName: string,
    email: string,
    password: string,
  ): Promise<UserProfile> {
    if (USE_MOCK) {
      return {
        ...MOCK_PROFILE,
        name: displayName.trim(),
        username: "",
        is_guest: false,
        onboarding_completed: false,
      }
    }
    const normalizedEmail = email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: displayName.trim(),
          is_guest: false,
        },
      },
    })
    if (error) throw error
    if (!data.user)
      throw new Error("Akun belum dapat dibuat. Silakan coba lagi.")
    if (!data.session) {
      throw new Error(
        "Pendaftaran berhasil, tetapi konfirmasi email masih aktif di Supabase. Nonaktifkan Confirm email agar pengguna bisa langsung masuk.",
      )
    }
    return this._fetchProfile(data.user.id)
  }

  async upgradeGuestAccount(email: string, password: string): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.auth.updateUser({
      email: email.trim().toLowerCase(),
      password,
      data: { is_guest: false },
    })
    if (error) throw error
  }

  async loginAsGuest(): Promise<UserProfile> {
    if (USE_MOCK)
      return {
        ...MOCK_PROFILE,
        name: "Pengunjung",
        username: "",
        is_guest: true,
        onboarding_completed: false,
      }
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    const profile = await userService.ensureProfile(data.user.id, {
      name: "Pengunjung",
      username: "",
      is_guest: true,
      onboarding_completed: false,
    })
    return { ...profile, is_guest: true, name: profile.name || "Pengunjung" }
  }

  async logout(): Promise<void> {
    if (USE_MOCK) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getSession(): Promise<UserProfile | null> {
    if (USE_MOCK) return MOCK_PROFILE
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null
    return this._fetchProfile(session.user.id)
  }

  private async _fetchProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (error) {
      // Fallback profile if not present yet
      return {
        ...MOCK_PROFILE,
        id: userId,
        name: "Pengunjung",
        username: "",
        is_guest: true,
        onboarding_completed: false,
      }
    }
    return data as UserProfile
  }
}

export const authService: IAuthService = new SupabaseAuthService()
