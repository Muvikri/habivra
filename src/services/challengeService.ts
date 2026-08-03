import { supabase } from '../lib/supabase'
import type { Challenge } from '../types'
import { offlineStore } from './offlineStore'

const USE_MOCK = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
const isOnline = () => typeof navigator === 'undefined' || navigator.onLine

type CommunityChallenge = {
  id: string
  icon: string
  title: string
  days: number
  reward: string
  color: string
}

type ChallengeParticipant = {
  challenge_id: string
  user_id: string
  progress: number
  done: boolean
}

function toChallenge(event: CommunityChallenge, userId: string, participant?: ChallengeParticipant): Challenge {
  return {
    id: event.id,
    user_id: userId,
    icon: event.icon,
    title: event.title,
    days: event.days,
    reward: event.reward,
    color: event.color,
    joined: Boolean(participant),
    progress: participant?.progress ?? 0,
    done: participant?.done ?? false,
  }
}

export interface IChallengeService {
  getChallenges(userId: string): Promise<Challenge[]>
  joinChallenge(userId: string, id: string): Promise<Challenge>
  updateProgress(userId: string, id: string, progress: number): Promise<Challenge>
}

class SupabaseChallengeService implements IChallengeService {
  async getChallenges(userId: string): Promise<Challenge[]> {
    if (USE_MOCK) {
      return []
    }
    if (!isOnline()) return offlineStore.getChallenges(userId)

    const now = new Date().toISOString()
    const { data: events, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_published', true)
      .lte('starts_at', now)
      .gt('ends_at', now)
      .order('starts_at', { ascending: false })
    if (error) return offlineStore.getChallenges(userId)

    const activeEvents = (events || []) as CommunityChallenge[]
    if (activeEvents.length === 0) {
      await offlineStore.setChallenges(userId, [])
      return []
    }

    const { data: participants, error: participantError } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('user_id', userId)
      .in('challenge_id', activeEvents.map(event => event.id))
    if (participantError) return offlineStore.getChallenges(userId)

    const participantByEvent = new Map(((participants || []) as ChallengeParticipant[]).map(participant => [participant.challenge_id, participant]))
    const challenges = activeEvents.map(event => toChallenge(event, userId, participantByEvent.get(event.id)))
    await offlineStore.setChallenges(userId, challenges)
    return challenges
  }

  async joinChallenge(userId: string, id: string): Promise<Challenge> {
    const cached = await offlineStore.getChallenges(userId)
    const current = cached.find(challenge => challenge.id === id)
    if (!current) throw new Error('Tantangan tidak ditemukan atau sudah berakhir.')
    const updated = { ...current, joined: true }
    await offlineStore.setChallenges(userId, cached.map(challenge => challenge.id === id ? updated : challenge))

    if (USE_MOCK) return updated
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'challenge.join', id })
      return updated
    }
    const { error } = await supabase.from('challenge_participants').upsert(
      { challenge_id: id, user_id: userId, progress: 0, done: false },
      { onConflict: 'challenge_id,user_id', ignoreDuplicates: true },
    )
    if (error) {
      await offlineStore.enqueue(userId, { type: 'challenge.join', id })
    }
    return updated
  }

  async updateProgress(userId: string, id: string, progress: number): Promise<Challenge> {
    const cached = await offlineStore.getChallenges(userId)
    const current = cached.find(challenge => challenge.id === id)
    if (!current || !current.joined) throw new Error('Ikuti tantangan terlebih dahulu.')
    const clampedProgress = Math.max(0, Math.min(100, progress))
    const updated = { ...current, progress: clampedProgress, done: clampedProgress >= 100 }
    await offlineStore.setChallenges(userId, cached.map(challenge => challenge.id === id ? updated : challenge))

    if (USE_MOCK) return updated
    if (!isOnline()) {
      await offlineStore.enqueue(userId, { type: 'challenge.progress', id, progress: clampedProgress })
      return updated
    }
    const { error } = await supabase
      .from('challenge_participants')
      .update({ progress: clampedProgress, done: clampedProgress >= 100 })
      .eq('challenge_id', id)
      .eq('user_id', userId)
    if (error) await offlineStore.enqueue(userId, { type: 'challenge.progress', id, progress: clampedProgress })
    return updated
  }
}

export const challengeService: IChallengeService = new SupabaseChallengeService()
