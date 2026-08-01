import type { Habit, Challenge, Goal, Achievement, WeekDay, UserProfile, ChatMessage, AIInsight } from '../types'

export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'

export const MOCK_PROFILE: UserProfile = {
  id: MOCK_USER_ID,
  name: 'Vito Eco',
  level: 3,
  level_name: 'Pahlawan Hijau',
  xp: 180,
  xp_to_next_level: 300,
  streak: 5,
  total_habits_done: 28,
  onboarding_completed: true,
  avatar_url: null,
  theme: 'dark',
  reminder_enabled: true,
  language: 'id',
}

export const MOCK_HABITS: Habit[] = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    user_id: MOCK_USER_ID,
    icon: '🧴',
    title: 'Membawa Tumbler',
    xp: 10,
    done: false,
    desc: 'Membawa tumbler membantu mengurangi penggunaan botol plastik sekali pakai yang mencemari lingkungan.',
    benefits: ['Mengurangi sampah plastik', 'Menghemat biaya pembelian', 'Mengurangi emisi produksi plastik'],
    impact: '2 botol plastik/hari',
    streak_days: [true, true, true, true, true, false, false],
    streak_count: 5,
    category: 'waste',
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    user_id: MOCK_USER_ID,
    icon: '💡',
    title: 'Mematikan Lampu',
    xp: 8,
    done: false,
    desc: 'Mematikan lampu saat meninggalkan ruangan adalah cara paling mudah menghemat energi listrik setiap hari.',
    benefits: ['Menghemat tagihan listrik', 'Mengurangi konsumsi energi', 'Memperpanjang umur lampu'],
    impact: '0.2 kWh/hari',
    streak_days: [true, false, true, true, false, true, false],
    streak_count: 3,
    category: 'energy',
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    user_id: MOCK_USER_ID,
    icon: '🚶',
    title: 'Jalan Kaki 1 km',
    xp: 12,
    done: false,
    desc: 'Memilih jalan kaki untuk jarak pendek mengurangi emisi karbon dan sekaligus menjaga kesehatan tubuh.',
    benefits: ['Mengurangi emisi CO₂ kendaraan', 'Menyehatkan jantung & tubuh', 'Mengurangi kemacetan'],
    impact: '0.15 kg CO₂/hari',
    streak_days: [true, true, false, true, true, true, false],
    streak_count: 4,
    category: 'mobility',
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    user_id: MOCK_USER_ID,
    icon: '♻️',
    title: 'Memilah Sampah',
    xp: 10,
    done: true,
    desc: 'Memisahkan sampah organik dan anorganik memudahkan proses daur ulang dan mengurangi beban TPA.',
    benefits: ['Memudahkan proses daur ulang', 'Mengurangi beban tempat pembuangan', 'Mendukung ekonomi sirkular'],
    impact: '0.5 kg sampah terdaur ulang',
    streak_days: [false, true, true, false, true, true, true],
    streak_count: 3,
    category: 'recycling',
  },
]

export const MOCK_CHALLENGES: Challenge[] = [
  { id: 'c-1', user_id: MOCK_USER_ID, icon: '🥤', title: 'Tanpa Sedotan Plastik', days: 7, progress: 5, reward: '150 XP + Badge', color: '#22c55e', done: false, joined: true },
  { id: 'c-2', user_id: MOCK_USER_ID, icon: '🧴', title: 'Bawa Tumbler 7 Hari', days: 7, progress: 100, reward: '200 XP + Badge', color: '#a3e635', done: true, joined: true },
  { id: 'c-3', user_id: MOCK_USER_ID, icon: '🚶', title: 'Jalan Kaki 5 Hari', days: 5, progress: 60, reward: '120 XP', color: '#34d399', done: false, joined: true },
  { id: 'c-4', user_id: MOCK_USER_ID, icon: '⚡', title: 'Hemat Listrik Seminggu', days: 7, progress: 28, reward: '100 XP', color: '#fbbf24', done: false, joined: false },
]

export const MOCK_GOALS: Goal[] = [
  { id: 1, icon: '🌿', label: 'Kurangi Sampah Plastik' },
  { id: 2, icon: '⚡', label: 'Hemat Energi' },
  { id: 3, icon: '🚲', label: 'Kurangi Emisi Karbon' },
  { id: 4, icon: '♻️', label: 'Tingkatkan Daur Ulang' },
  { id: 5, icon: '🌎', label: 'Semua Tujuan' },
]

export const MOCK_WEEK_DAYS: WeekDay[] = [
  { day: 'Sen', done: true }, { day: 'Sel', done: true }, { day: 'Rab', done: false },
  { day: 'Kam', done: true }, { day: 'Jum', done: true }, { day: 'Sab', done: true }, { day: 'Min', done: true },
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { icon: '🌱', title: 'Eco Beginner', desc: 'Selesaikan 10 habit', unlocked: true },
  { icon: '🌿', title: 'Green Starter', desc: 'Streak 7 hari', unlocked: true },
  { icon: '🌳', title: 'Green Hero', desc: 'Selesaikan 50 habit', unlocked: false },
  { icon: '🌲', title: 'Forest Guardian', desc: 'Streak 30 hari', unlocked: false },
  { icon: '🌎', title: 'Earth Protector', desc: 'Streak 100 hari', unlocked: false },
]

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: 1, icon: '💡', text: 'Membawa botol sendiri dapat menghemat hingga 170 botol plastik per tahun.' },
  { id: 2, icon: '🚗', text: 'Berjalan kaki 1 km menghemat sekitar 120 gram emisi CO₂ dibanding naik motor.' },
  { id: 3, icon: '🌱', text: 'Kombinasi habitmu minggu ini berpotensi menyelamatkan 1 pohon dari pembalakan!' },
]

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm-1', user_id: MOCK_USER_ID, from_role: 'ai', text: 'Halo Vito! 🌿 Saya Eco Coach, siap membantumu membangun gaya hidup ramah lingkungan. Apa yang ingin kamu diskusikan hari ini?', created_at: new Date(Date.now() - 3600000).toISOString() },
]
