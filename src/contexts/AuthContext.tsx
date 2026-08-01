import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { userService } from '../services/userService'
import type { UserProfile } from '../types'
import { MOCK_PROFILE } from '../constants/mockData'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  refresh: () => Promise<void>
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(USE_MOCK ? MOCK_PROFILE : null)
  const [loading, setLoading] = useState(!USE_MOCK)

  const loadUser = useCallback(async (id: string) => {
    try {
      const profile = await userService.getProfile(id)
      setUser(profile)
    } catch {
      setUser(MOCK_PROFILE)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (USE_MOCK) {
      setUser(MOCK_PROFILE)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUser(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUser])

  const refresh = async () => {
    if (USE_MOCK) {
      if (user) {
        const profile = await userService.getProfile(user.id)
        setUser(profile)
      }
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (session) await loadUser(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
