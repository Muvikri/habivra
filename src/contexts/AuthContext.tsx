import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { supabase } from "../lib/supabase"
import { notificationService } from "../services/notificationService"
import { userService } from "../services/userService"
import { syncService } from "../services/syncService"
import type { UserProfile } from "../types"
import { MOCK_PROFILE } from "../constants/mockData"

const USE_MOCK =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes("placeholder")

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
  const [user, setUser] = useState<UserProfile | null>(
    USE_MOCK ? MOCK_PROFILE : null,
  )
  const [loading, setLoading] = useState(!USE_MOCK)

  const loadUser = useCallback(async (id: string, isGuest = false) => {
    try {
      const profile = await userService.ensureProfile(
        id,
        isGuest
          ? {
              name: "Pengunjung",
              username: "",
              is_guest: true,
              onboarding_completed: false,
            }
          : {},
      )
      const resolvedProfile = isGuest
        ? { ...profile, is_guest: true, name: profile.name || "Pengunjung" }
        : profile
      setUser(resolvedProfile)
      void syncService.start(id)
      if (profile.reminder_enabled) {
        void notificationService.scheduleDailyReminder(
          profile.reminder_hour,
          profile.reminder_minute,
        )
      } else {
        void notificationService.cancelDailyReminder()
      }
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
        loadUser(
          session.user.id,
          Boolean((session.user as { is_anonymous?: boolean }).is_anonymous),
        )
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser(
          session.user.id,
          Boolean((session.user as { is_anonymous?: boolean }).is_anonymous),
        )
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
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session)
      await loadUser(
        session.user.id,
        Boolean((session.user as { is_anonymous?: boolean }).is_anonymous),
      )
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
