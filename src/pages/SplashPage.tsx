import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { LeafDecoration } from "../components/shared/LeafDecoration"
import { Emoji } from "../components/shared/Emoji"
import splashIcon from "../assets/habivra-splash-icon.png"

export function SplashPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      navigate(
        user
          ? user.onboarding_completed
            ? "/app/dashboard"
            : "/onboarding"
          : "/login",
        { replace: true },
      )
    }, 900)
    return () => clearTimeout(timer)
  }, [loading, navigate, user])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[500px] flex-1 px-6 text-center select-none overflow-hidden">
      <LeafDecoration />

      <div className="relative z-10 flex flex-col items-center pop-in">
        <div className="relative mb-6 size-32 overflow-hidden rounded-[2rem] border border-white/60 bg-[#fff5e3] shadow-[0_12px_32px_rgba(22,163,74,0.28)] pulse-ring">
          <img
            src={splashIcon}
            alt="Logo Habivra"
            className="size-full object-cover"
          />
          <div className="hidden w-full h-full rounded-[22px] bg-[var(--bg-primary)] flex items-center justify-center">
            <Emoji size="4xl">🌱</Emoji>
          </div>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] mb-2">
          Habivra
        </h1>
        <p className="text-sm font-bold text-[var(--accent-primary)] tracking-wide">
          Small Actions, Big Impact.
        </p>

        <div className="mt-12 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-ping" />
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Memuat aplikasi...
          </span>
        </div>
      </div>
    </div>
  )
}
