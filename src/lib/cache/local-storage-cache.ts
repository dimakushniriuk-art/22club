/**
 * Cache persistente con localStorage per dati che devono sopravvivere al reload
 * Utile per statistiche e dati che cambiano raramente
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('LocalStorageCache')

interface CacheEntry<T> {
  data: T
  expiresAt: number
  version: string
}

const CACHE_VERSION = '1.0.0'
const MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB max per localStorage

export class LocalStorageCache {
  private static instance: LocalStorageCache
  private memoryCache = new Map<string, CacheEntry<unknown>>()

  static getInstance(): LocalStorageCache {
    if (!LocalStorageCache.instance) {
      LocalStorageCache.instance = new LocalStorageCache()
    }
    return LocalStorageCache.instance
  }

  /**
   * Ottiene dati dalla cache (prima memoria, poi localStorage)
   */
  get<T>(key: string): T | null {
    // Controlla cache in memoria
    const memoryEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data
    }

    // Controlla localStorage
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (!stored) return null

      const entry: CacheEntry<T> = JSON.parse(stored)

      // Verifica versione
      if (entry.version !== CACHE_VERSION) {
        this.delete(key)
        return null
      }

      // Verifica scadenza
      if (entry.expiresAt <= Date.now()) {
        this.delete(key)
        return null
      }

      // Salva in memoria per accesso rapido
      this.memoryCache.set(key, entry)

      return entry.data
    } catch (error) {
      // Logging gestito automaticamente (errore non critico, ritorna null)
      logger.error('Error reading cache', error, { key })
      return null
    }
  }

  /**
   * Salva dati nella cache (memoria + localStorage)
   */
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
      version: CACHE_VERSION,
    }

    // Salva in memoria
    this.memoryCache.set(key, entry)

    // Salva in localStorage (se disponibile)
    if (typeof window === 'undefined') return

    try {
      const serialized = JSON.stringify(entry)
      const size = new Blob([serialized]).size

      // Verifica dimensione max
      if (size > MAX_CACHE_SIZE) {
        logger.warn('Entry too large for localStorage', { key, size, maxSize: MAX_CACHE_SIZE })
        return
      }

      localStorage.setItem(`cache_${key}`, serialized)
    } catch (error) {
      // localStorage potrebbe essere pieno o non disponibile
      if (error instanceof DOMException && error.code === 22) {
        // QuotaExceededError - pulisci cache vecchia
        this.cleanup()
        try {
          localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
        } catch (retryError) {
          logger.error('Failed to store after cleanup', retryError, { key })
        }
      } else {
        logger.error('Error storing cache', error, { key })
      }
    }
  }

  /**
   * Elimina entry dalla cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key)

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_${key}`)
      } catch (error) {
        logger.error('Error deleting cache', error, { key })
      }
    }
  }

  /**
   * Pulisce tutte le entry scadute
   */
  cleanup(): void {
    const now = Date.now()

    // Pulisci memoria
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key)
      }
    }

    // Pulisci localStorage
    if (typeof window === 'undefined') return

    try {
      const keysToDelete: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache_')) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry: CacheEntry<unknown> = JSON.parse(stored)
              if (entry.expiresAt <= now || entry.version !== CACHE_VERSION) {
                keysToDelete.push(key)
              }
            }
          } catch {
            // Entry corrotta, elimina
            keysToDelete.push(key)
          }
        }
      }

      keysToDelete.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      logger.error('Error during cleanup', error)
    }
  }

  /**
   * Pulisce tutta la cache
   */
  clear(): void {
    this.memoryCache.clear()

    if (typeof window === 'undefined') return

    try {
      const keysToDelete: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache_')) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      logger.error('Error clearing cache', error)
    }
  }

  /**
   * Ottiene dimensione approssimativa della cache
   */
  getSize(): number {
    let size = 0

    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('cache_')) {
            const value = localStorage.getItem(key)
            if (value) {
              size += new Blob([value]).size
            }
          }
        }
      } catch (error) {
        logger.error('Error calculating size', error)
      }
    }

    return size
  }
}

// Singleton instance
export const localStorageCache = LocalStorageCache.getInstance()

// Cleanup automatico all'avvio
if (typeof window !== 'undefined') {
  localStorageCache.cleanup()
}
