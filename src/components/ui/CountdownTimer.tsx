'use client'

import { useState, useEffect } from 'react'
import { differenceInSeconds } from 'date-fns'

interface CountdownTimerProps {
  deadline: string | Date | null
  className?: string
}

export function CountdownTimer({ deadline, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No deadline')
      return
    }

    const target = new Date(deadline)

    function update() {
      const now = new Date()
      const diff = differenceInSeconds(target, now)

      if (diff <= 0) {
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(diff / 86400)
      const hours = Math.floor((diff % 86400) / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  const colorClass = (() => {
    if (!deadline) return 'text-text-muted'
    const diff = differenceInSeconds(new Date(deadline), new Date())
    if (diff <= 0) return 'text-text-muted'
    if (diff < 12 * 3600) return 'text-danger animate-glow-pulse'  // < 12h = red
    if (diff < 48 * 3600) return 'text-warning'                     // < 48h = amber
    return 'text-success'                                            // > 48h = green
  })()

  return (
    <span className={`font-mono ${colorClass} ${className}`}>
      {timeLeft}
    </span>
  )
}
