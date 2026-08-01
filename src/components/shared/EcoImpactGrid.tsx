import React from 'react'
import type { Habit } from '../../types'
import { Emoji } from './Emoji'

export function EcoImpactGrid({ habits }: { habits: Habit[] }) {
  const completedHabits = habits.filter(habit => habit.done)
  const plasticReduced = completedHabits.filter(habit => habit.category === 'waste' || habit.category === 'recycling').length * 2
  const co2Reduced = completedHabits.filter(habit => habit.category === 'mobility').length * 0.15
  const energySaved = completedHabits.filter(habit => habit.category === 'energy').length * 0.2
  const impacts = [
    { icon: '🧴', value: `${plasticReduced} Botol`, label: 'Plastik Ditekan', color: 'from-emerald-500/10 to-teal-500/5' },
    { icon: '🚗', value: `${co2Reduced.toFixed(2)} kg`, label: 'CO₂ Dikurangi', color: 'from-green-500/10 to-emerald-500/5' },
    { icon: '💡', value: `${energySaved.toFixed(1)} kWh`, label: 'Listrik Dihemat', color: 'from-lime-500/10 to-green-500/5' },
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {impacts.map((item, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} border border-[var(--border-default)] flex flex-col items-center text-center`}
        >
          <Emoji size="xl" className="mb-1">{item.icon}</Emoji>
          <span className="text-xs font-black text-[var(--text-primary)] leading-tight">{item.value}</span>
          <span className="text-[10px] font-semibold text-[var(--text-muted)] mt-0.5">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
