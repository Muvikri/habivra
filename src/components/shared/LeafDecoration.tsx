import React from 'react'
import { Emoji } from './Emoji'

export function LeafDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <span className="absolute top-10 left-6 text-3xl leaf-anim-1 drop-shadow-[0_2px_8px_rgba(22,163,74,0.4)]">
        <Emoji size="2xl">🌿</Emoji>
      </span>
      <span className="absolute top-24 right-8 text-2xl leaf-anim-2 drop-shadow-[0_2px_8px_rgba(34,197,94,0.3)]">
        <Emoji size="xl">🍃</Emoji>
      </span>
      <span className="absolute bottom-32 left-10 text-xl leaf-anim-3 drop-shadow-[0_2px_6px_rgba(163,230,53,0.3)]">
        <Emoji size="lg">🌱</Emoji>
      </span>
      <span className="absolute bottom-16 right-12 text-2xl leaf-anim-4 drop-shadow-[0_2px_8px_rgba(22,163,74,0.3)]">
        <Emoji size="xl">🍀</Emoji>
      </span>
    </div>
  )
}
