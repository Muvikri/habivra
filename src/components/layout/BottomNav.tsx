import {
  Bot,
  ChartNoAxesCombined,
  House,
  Target,
  UserRound,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

const items = [
  { id: "dashboard", path: "/app/dashboard", icon: House, label: "Home" },
  {
    id: "progress",
    path: "/app/progress",
    icon: ChartNoAxesCombined,
    label: "Progress",
  },
  { id: "challenge", path: "/app/challenge", icon: Target, label: "Challenge" },
  { id: "ai-coach", path: "/app/ai-coach", icon: Bot, label: "AI Coach" },
  { id: "profile", path: "/app/profile", icon: UserRound, label: "Profil" },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex h-[68px] items-center justify-between rounded-[1.4rem] border border-[var(--border-default)] bg-[var(--bg-card)] px-1.5 shadow-[0_10px_30px_rgba(5,30,15,0.22)]">
        {items.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.id === "dashboard" && location.pathname === "/app")
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-200 ${
                isActive
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                  isActive ? "bg-[var(--accent-muted)]" : "bg-transparent"
                }`}
              >
                <Icon className="size-[21px] stroke-[2.25]" />
              </span>
              <span
                className={`text-[9px] leading-none ${
                  isActive ? "font-black" : "font-bold"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
