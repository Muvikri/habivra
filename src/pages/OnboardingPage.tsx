import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Emoji } from '../components/shared/Emoji'
import { ArrowLeft } from 'lucide-react'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [slide, setSlide] = useState(0)

  const slides = [
    {
      icon: '🌱',
      title: 'Lacak Kebiasaan Hijau',
      desc: 'Bangun kebiasaan ramah lingkungan secara konsisten setiap hari dengan mudah dan menyenangkan.',
    },
    {
      icon: '🏆',
      title: 'Dapatkan XP & Badge',
      desc: 'Setiap aksi positif memberimu XP, meningkatkan levelmu, dan membuka badge kehormatan eco-warrior.',
    },
    {
      icon: '🤖',
      title: 'Dampingan AI Eco Coach',
      desc: 'Dapatkan masukan dan rekomendasi langsung dari AI Coach yang disesuaikan dengan preferensimu.',
    },
  ]

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1)
    } else {
      navigate('/setup/goals')
    }
  }

  const handleBack = () => {
    if (slide > 0) {
      setSlide(slide - 1)
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          aria-label={slide === 0 ? 'Kembali ke Login' : 'Kembali'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--accent-muted)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {slide === 0 ? 'Kembali ke Login' : 'Kembali'}
        </button>

        <button
          onClick={() => navigate('/setup/goals')}
          className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
        >
          Lewati
        </button>
      </div>

      <div className="my-auto text-center px-4 space-y-6">
        <div className="w-28 h-28 rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-default)] flex items-center justify-center mx-auto shadow-md pop-in">
          <Emoji size="4xl">{slides[slide].icon}</Emoji>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
            {slides[slide].title}
          </h2>
          <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
            {slides[slide].desc}
          </p>
        </div>

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                slide === idx
                  ? 'w-6 bg-[var(--accent-primary)]'
                  : 'w-2 bg-[var(--border-default)]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black hover:bg-[var(--accent-secondary)] transition-all shadow-md active:scale-95"
        >
          {slide === slides.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}
        </button>
      </div>
    </div>
  )
}
