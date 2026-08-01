import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ChevronRight, UserRound } from 'lucide-react'
import { PageHeader } from '../components/layout/PageHeader'
import { MOCK_GOALS } from '../constants/mockData'
import { Emoji } from '../components/shared/Emoji'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../services/userService'

export function GoalSetupPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [step, setStep] = useState<'profile' | 'goals'>('profile')
  const [selected, setSelected] = useState<number[]>([1])
  const [name, setName] = useState(user?.name === 'Pengguna' ? '' : user?.name || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleGoal = (id: number) => {
    setSelected(current => current.includes(id) ? current.filter(goalId => goalId !== id) : [...current, id])
  }

  const handleAvatarChange = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Pilih file gambar yang valid.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setErrorMessage('')
  }

  const handleProfileNext = async () => {
    if (!user || !name.trim()) {
      setErrorMessage('Masukkan nama yang ingin ditampilkan.')
      return
    }
    setSaving(true)
    setErrorMessage('')
    try {
      const avatarUrl = avatarFile ? await userService.uploadAvatar(user.id, avatarFile) : user.avatar_url
      const updatedUser = await userService.updateProfile(user.id, { name: name.trim(), avatar_url: avatarUrl })
      setUser(updatedUser)
      setStep('goals')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Profil belum dapat disimpan.')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'profile') {
    return (
      <div className="flex-1 flex flex-col justify-between p-6">
        <div className="space-y-6">
          <PageHeader title="Buat Profilmu" subtitle="Langkah 1 dari 2 · Kenalkan dirimu ke Habivra" showBack backPath="/onboarding" />
          <div className="flex flex-col items-center gap-3 pt-3">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative w-28 h-28 rounded-3xl overflow-hidden bg-[var(--accent-muted)] border-2 border-[var(--border-default)] flex items-center justify-center text-[var(--accent-primary)]">
              {avatarPreview ? <img src={avatarPreview} alt="Foto profil" className="w-full h-full object-cover" /> : <UserRound className="size-12" />}
              <span className="absolute bottom-0 right-0 p-2 rounded-tl-xl bg-[var(--accent-primary)] text-white"><Camera className="size-4" /></span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={event => handleAvatarChange(event.target.files?.[0])} />
            <p className="text-xs font-semibold text-[var(--text-muted)]">Tambahkan foto profil (opsional, maks. 2 MB)</p>
          </div>
          <div>
            <label className="block text-xs font-extrabold text-[var(--text-primary)] mb-2">Nama tampilan</label>
            <input value={name} onChange={event => setName(event.target.value)} maxLength={40} placeholder="Contoh: Vito" className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
          </div>
          {errorMessage && <p className="text-center text-xs font-bold text-red-500">{errorMessage}</p>}
        </div>
        <button onClick={handleProfileNext} disabled={saving} className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black transition-all shadow-md active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2">
          {saving ? 'Menyimpan...' : 'Lanjut ke Tujuan'} <ChevronRight className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <div>
        <PageHeader title="Pilih Tujuanmu" subtitle="Langkah 2 dari 2 · Pilih satu atau lebih fokus kebiasaan hijau" />
        <button onClick={() => setStep('profile')} className="mt-4 text-xs font-bold text-[var(--accent-primary)]">← Edit profil</button>
        <div className="space-y-3 mt-4">
          {MOCK_GOALS.map(goal => {
            const isSelected = selected.includes(goal.id)
            return (
              <button key={goal.id} type="button" onClick={() => toggleGoal(goal.id)} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all duration-200 ${isSelected ? 'bg-[var(--bg-secondary)] border-[var(--accent-primary)] shadow-sm' : 'bg-[var(--bg-card)] border-[var(--border-default)] hover:border-[var(--accent-muted)]'}`}>
                <div className="flex items-center gap-3.5"><div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center"><Emoji size="xl">{goal.icon}</Emoji></div><span className="font-extrabold text-sm text-[var(--text-primary)]">{goal.label}</span></div>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-all ${isSelected ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'border-[var(--border-default)] text-transparent'}`}>✓</div>
              </button>
            )
          })}
        </div>
      </div>
      <button onClick={() => navigate('/setup/habits')} disabled={selected.length === 0} className={`w-full py-4 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 ${selected.length === 0 ? 'bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed opacity-50' : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'}`}>Lanjut ke Rekomendasi Habit</button>
    </div>
  )
}
