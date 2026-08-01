import { useEffect, useState, type CSSProperties } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { habitService } from '../services/habitService'
import type { Habit } from '../types'
import { Emoji } from '../components/shared/Emoji'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const confettiColors = ['#16a34a', '#22c55e', '#a3e635', '#34d399', '#fbbf24', '#60a5fa', '#f472b6']

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const confettiPieces = Array.from({ length: 38 }, (_, index) => {
  const random = (offset: number) => seededRandom(index * 11 + offset)
  const width = 4 + random(1) * 5
  const isRound = random(2) > 0.7

  return {
    left: `${random(3) * 100}%`,
    top: `${-8 + random(4) * 62}%`,
    width: `${width}px`,
    height: `${isRound ? width : 8 + random(5) * 10}px`,
    backgroundColor: confettiColors[index % confettiColors.length],
    borderRadius: isRound ? '999px' : random(6) > 0.5 ? '2px' : '1px 5px',
    '--confetti-duration': `${2.3 + random(8) * 1.45}s`,
    '--confetti-delay': `${random(7) * 0.75}s`,
    '--confetti-drift-x': `${-82 + random(9) * 164}px`,
    '--confetti-drift-y': `${150 + random(10) * 210}px`,
    '--confetti-rotation': `${360 + random(11) * 900}deg`,
  } as CSSProperties & Record<`--${string}`, string>
})

export function HabitCompletePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [habit, setHabit] = useState<Habit | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)

  // Fix Bug #4: Confetti stops after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (id) {
      habitService.getHabitById(id).then(setHabit)
    }
  }, [id])

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden text-center">
      {/* Confetti Animation Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {confettiPieces.map((style, i) => (
            <div
              key={i}
              className="absolute confetti-piece"
              style={style}
            />
          ))}
        </div>
      )}

      <div className="my-auto space-y-6 relative z-10 pop-in">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-lime)] p-1 mx-auto shadow-2xl pulse-ring">
          <div className="w-full h-full rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
            <Emoji size="4xl">{habit?.icon || '🎉'}</Emoji>
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--accent-muted)] text-[var(--accent-primary)] text-xs font-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Habit Selesai!
          </span>

          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {habit?.title || 'Luar Biasa!'}
          </h1>

          <p className="text-xs font-semibold text-[var(--text-muted)] max-w-xs mx-auto">
            Kamu baru saja membuat dampak nyata bagi kelestarian lingkungan!
          </p>
        </div>

        <div className="inline-block p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-sm">
          <p className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
            Hadiah yang Didapat
          </p>
          <p className="text-3xl font-black text-[var(--accent-primary)] mt-1">
            +{habit?.xp || 10} XP
          </p>
        </div>
      </div>

      <div className="pb-4 relative z-10">
        <button
          onClick={() => navigate('/app/dashboard')}
          className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          Lanjut ke Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
