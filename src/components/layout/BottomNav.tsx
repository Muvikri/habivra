import { useLocation, useNavigate } from 'react-router-dom'
import { Emoji } from '../shared/Emoji'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const items = [
    { id: 'dashboard', path: '/app/dashboard', icon: '🏠', label: 'Home' },
    { id: 'progress', path: '/app/progress', icon: '📊', label: 'Progress' },
    { id: 'challenge', path: '/app/challenge', icon: '🎯', label: 'Challenge' },
    { id: 'ai-coach', path: '/app/ai-coach', icon: '🤖', label: 'AI Coach' },
    { id: 'profile', path: '/app/profile', icon: '👤', label: 'Profil' },
  ]

  const currentPath = location.pathname

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent"
    >
      <div className="flex items-center justify-around rounded-3xl px-2 py-3 bg-[var(--bg-card)] border border-[var(--border-default)] shadow-[var(--shadow-elevated)]">
        {items.map(item => {
          const isActive = currentPath === item.path || (item.id === 'dashboard' && currentPath === '/app')
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <Emoji
                size="lg"
                className={isActive ? 'text-[var(--accent-primary)]' : ''}
              >
                {item.icon}
              </Emoji>
              <span
                className={`text-[10px] font-bold ${
                  isActive ? 'text-[var(--accent-light)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
