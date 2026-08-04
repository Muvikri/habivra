import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Theme } from "../types"
import { userService } from "../services/userService"

interface ThemeContextValue {
  theme: Theme
  setTheme: (newTheme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  userId,
}: {
  children: ReactNode
  userId?: string
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("habivra_theme") as Theme
    if (saved && ["light", "dark", "system"].includes(saved)) return saved
    return "light"
  })

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }

    if (theme === "system") {
      // Browsers without matchMedia use the light palette as a safe fallback.
      if (!window.matchMedia) {
        applyTheme(false)
        return
      }

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      applyTheme(mediaQuery.matches)

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mediaQuery.addEventListener("change", listener)
      return () => mediaQuery.removeEventListener("change", listener)
    } else {
      applyTheme(theme === "dark")
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("habivra_theme", newTheme)
    if (userId) {
      userService.updateProfile(userId, { theme: newTheme }).catch(() => {})
    }
  }

  return createElement(
    ThemeContext.Provider,
    { value: { theme, setTheme } },
    children,
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
