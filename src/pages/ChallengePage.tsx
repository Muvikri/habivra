import { useEffect, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { challengeService } from '../services/challengeService'
import { useAuth } from '../contexts/AuthContext'
import type { Challenge } from '../types'
import { ChallengeCard } from '../components/shared/ChallengeCard'
import { BottomNav } from '../components/layout/BottomNav'
import { useToast } from '../hooks/useToast'
import { ToastProvider } from '../components/shared/ToastProvider'
import { Emoji } from '../components/shared/Emoji'

export function ChallengePage() {
  const { user } = useAuth()
  const { toasts, show: showToast } = useToast()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    challengeService.getChallenges(user.id).then(data => {
      setChallenges(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const handleJoin = async (id: string) => {
    try {
      if (!user) return
      const updated = await challengeService.joinChallenge(user.id, id)
      setChallenges(prev => prev.map(c => c.id === id ? updated : c))
      showToast(`Berhasil mengikuti tantangan "${updated.title}"! 🎯`, 'success')
    } catch {
      showToast('Gagal mengikuti tantangan', 'error')
    }
  }

  const joinedList = challenges.filter(c => c.joined)
  const availableList = challenges.filter(c => !c.joined)

  return (
    <div className="flex-1 flex flex-col justify-between">
      <ToastProvider toasts={toasts} />

      <div className="p-5 space-y-5">
        <PageHeader
          title="Tantangan Komunitas"
          subtitle="Tingkatkan komitmenmu dengan tantangan berdampak tinggi"
        />

        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-[var(--text-muted)]">
            Memuat tantangan...
          </div>
        ) : (
          <>
            {/* Joined Challenges */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] px-1">
                Tantangan Aktif ({joinedList.length}) 🎯
              </h3>
              {joinedList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center space-y-2">
                  <Emoji size="3xl">🏆</Emoji>
                  <p className="text-xs text-[var(--text-muted)] font-bold">
                    Belum ada tantangan aktif. Ikuti tantangan di bawah!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinedList.map(c => (
                    <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />
                  ))}
                </div>
              )}
            </div>

            {/* Available Challenges */}
            {availableList.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-sm text-[var(--text-primary)] px-1">
                  Rekomendasi Tantangan 🌱
                </h3>
                <div className="space-y-3">
                  {availableList.map(c => (
                    <ChallengeCard key={c.id} challenge={c} onJoin={handleJoin} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
