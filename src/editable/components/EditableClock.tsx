'use client'

import { useEffect, useState } from 'react'

export function EditableClock({ label = 'Global Newswire' }: { label?: string }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      )
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <span className="mono-label inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
      {label} <span className="text-[var(--slot4-accent)]">→</span> <span className="tabular-nums text-white">{time || '--:--:--'}</span>
    </span>
  )
}
