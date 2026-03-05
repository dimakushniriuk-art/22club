'use client'

import { useEffect, useState } from 'react'

/**
 * Client Component per mostrare data e ora
 * Evita hydration mismatch usando useState per renderizzare solo lato client
 */
export function TimeDisplay() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }))
      setDate(
        now.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 text-right">
      <div className="text-text-primary text-2xl font-bold text-white">{time || '--:--'}</div>
      <div className="text-text-secondary text-xs">{date || '---'}</div>
    </div>
  )
}
