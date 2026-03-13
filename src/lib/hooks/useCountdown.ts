'use client'

import { useState, useEffect } from 'react'
import { differenceInSeconds } from 'date-fns'

export function useCountdown(deadline: string | Date | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!deadline) {
      setSecondsLeft(null)
      return
    }

    const target = new Date(deadline)

    function update() {
      const diff = differenceInSeconds(target, new Date())
      setSecondsLeft(diff > 0 ? diff : 0)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return {
    secondsLeft,
    isExpired: secondsLeft === 0,
    isUrgent: secondsLeft !== null && secondsLeft > 0 && secondsLeft < 3600,
    formatted: secondsLeft === null
      ? 'No deadline'
      : secondsLeft <= 0
      ? 'Expired'
      : formatDuration(secondsLeft),
  }
}

function formatDuration(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}
