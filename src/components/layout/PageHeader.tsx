import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backPath?: string
  onBack?: () => void
  rightElement?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backPath,
  onBack,
  rightElement,
}: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backPath) {
      navigate(backPath)
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 z-20 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Kembali"
            className="p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--accent-muted)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  )
}
