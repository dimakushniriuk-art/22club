'use client'

import { useEffect, useState } from 'react'

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 10 * 60 * 1000 // 10 minuti in millisecondi
const STORAGE_KEY = '22club_login_attempts'

interface LoginAttempts {
  count: number
  lastAttempt: number
  lockedUntil: number | null
}

export function useLoginProtection() {
  const [isLocked, setIsLocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    // Carica i tentativi dal localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: LoginAttempts = JSON.parse(stored)
        const now = Date.now()

        // Se è ancora bloccato
        if (data.lockedUntil && now < data.lockedUntil) {
          setIsLocked(true)
          setRemainingTime(Math.ceil((data.lockedUntil - now) / 1000))
          setAttempts(data.count)
        } else if (data.lockedUntil && now >= data.lockedUntil) {
          // Sblocca se il tempo è scaduto
          localStorage.removeItem(STORAGE_KEY)
          setIsLocked(false)
          setRemainingTime(0)
          setAttempts(0)
        } else {
          setAttempts(data.count)
        }
      } catch {
        // Se c'è un errore nel parsing, rimuovi i dati corrotti
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLocked && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            localStorage.removeItem(STORAGE_KEY)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isLocked, remainingTime])

  const recordFailedAttempt = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    let data: LoginAttempts

    if (stored) {
      try {
        data = JSON.parse(stored)
      } catch {
        data = { count: 0, lastAttempt: 0, lockedUntil: null }
      }
    } else {
      data = { count: 0, lastAttempt: 0, lockedUntil: null }
    }

    const now = Date.now()
    data.count += 1
    data.lastAttempt = now

    // Se raggiunge il limite, blocca
    if (data.count >= MAX_ATTEMPTS) {
      data.lockedUntil = now + LOCKOUT_DURATION
      setIsLocked(true)
      setRemainingTime(Math.ceil(LOCKOUT_DURATION / 1000))
    }

    setAttempts(data.count)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const recordSuccessfulAttempt = () => {
    // Reset dei tentativi dopo un login riuscito
    localStorage.removeItem(STORAGE_KEY)
    setIsLocked(false)
    setRemainingTime(0)
    setAttempts(0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return {
    isLocked,
    remainingTime: formatTime(remainingTime),
    attempts,
    maxAttempts: MAX_ATTEMPTS,
    recordFailedAttempt,
    recordSuccessfulAttempt,
  }
}
