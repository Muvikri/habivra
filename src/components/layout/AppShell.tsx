import React from 'react'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex justify-center items-center p-0 sm:p-4 md:p-6 transition-colors duration-200">
      <div className="w-full max-w-md min-h-screen sm:min-h-[800px] sm:max-h-[92vh] flex flex-col bg-[var(--bg-card)] sm:rounded-3xl sm:border border-[var(--border-default)] sm:shadow-2xl overflow-hidden relative">
        <main className="flex-1 overflow-y-auto flex flex-col relative z-10 pb-24 scrollbar-none">
          {children}
        </main>
      </div>
    </div>
  )
}
