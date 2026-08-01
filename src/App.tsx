import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './hooks/useTheme'
import { AppShell } from './components/layout/AppShell'

import { SplashPage } from './pages/SplashPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { GoalSetupPage } from './pages/GoalSetupPage'
import { HabitRecPage } from './pages/HabitRecPage'
import { DashboardPage } from './pages/DashboardPage'
import { HabitDetailPage } from './pages/HabitDetailPage'
import { HabitCompletePage } from './pages/HabitCompletePage'
import { ProgressPage } from './pages/ProgressPage'
import { ChallengePage } from './pages/ChallengePage'
import { AICoachPage } from './pages/AICoachPage'
import { ProfilePage } from './pages/ProfilePage'

function AppTheme({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <ThemeProvider userId={user?.id}>{children}</ThemeProvider>
}

function SetupOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.onboarding_completed) return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppTheme>
          <AppShell>
            <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<SetupOnly><OnboardingPage /></SetupOnly>} />
            <Route path="/setup/goals" element={<SetupOnly><GoalSetupPage /></SetupOnly>} />
            <Route path="/setup/habits" element={<SetupOnly><HabitRecPage /></SetupOnly>} />

            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/dashboard" element={<DashboardPage />} />
            <Route path="/app/habit/:id" element={<HabitDetailPage />} />
            <Route path="/app/habit/:id/complete" element={<HabitCompletePage />} />
            <Route path="/app/progress" element={<ProgressPage />} />
            <Route path="/app/challenge" element={<ChallengePage />} />
            <Route path="/app/ai-coach" element={<AICoachPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />

            <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </AppShell>
        </AppTheme>
      </AuthProvider>
    </BrowserRouter>
  )
}
