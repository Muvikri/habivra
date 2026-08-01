import {
  Award,
  Bike,
  Bot,
  Car,
  ChartNoAxesCombined,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Clover,
  CupSoda,
  Footprints,
  GlassWater,
  Globe2,
  House,
  Leaf,
  Lightbulb,
  PartyPopper,
  Recycle,
  Sprout,
  Target,
  TreeDeciduous,
  Trees,
  Trophy,
  UserRound,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface EmojiProps {
  children: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  className?: string
  label?: string
}

const iconMap: Record<string, LucideIcon> = {
  '🏠': House,
  '📊': ChartNoAxesCombined,
  '🎯': Target,
  '🤖': Bot,
  '👤': UserRound,
  '🧴': GlassWater,
  '💡': Lightbulb,
  '🚶': Footprints,
  '♻️': Recycle,
  '🥤': CupSoda,
  '⚡': Zap,
  '🚲': Bike,
  '🚗': Car,
  '🌱': Sprout,
  '🌿': Leaf,
  '🍃': Leaf,
  '🍀': Clover,
  '🌎': Globe2,
  '🌍': Globe2,
  '🌏': Globe2,
  '🌳': TreeDeciduous,
  '🌲': Trees,
  '🏆': Trophy,
  '🎉': PartyPopper,
  '✅': CircleCheck,
  '❓': CircleHelp,
  '⚠️': CircleAlert,
  '⭐': Award,
}

export function Emoji({ children, size = 'md', className = '', label }: EmojiProps) {
  const sizeClasses: Record<NonNullable<EmojiProps['size']>, string> = {
    xs: 'size-3',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-7',
    '2xl': 'size-8',
    '3xl': 'size-10',
    '4xl': 'size-12',
  }
  const Icon = iconMap[children]

  if (Icon) {
    return <Icon className={`shrink-0 ${sizeClasses[size]} ${className}`} aria-label={label} />
  }

  return (
    <span
      className={`font-emoji inline-block leading-none text-inherit ${className}`}
      role="img"
      aria-label={label || 'emoji'}
    >
      {children}
    </span>
  )
}
