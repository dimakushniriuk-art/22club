/**
 * Strategie di caching avanzate per 22Club
 * Cache manager centralizzato con TTL e invalidazione intelligente
 */

import { localStorageCache } from './local-storage-cache'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:cache:cache-strategies')

export type CacheStrategy = 'athlete-profile' | 'frequent-query' | 'stats' | 'temporary'

export interface CacheConfig {
  strategy: CacheStrategy
  ttl: number // TTL in millisecondi
  staleWhileRevalidate?: boolean // Permette di servire dati stale mentre si aggiornano
  maxAge?: number // Max age per cache (opzionale)
}

/**
 * Configurazioni predefinite per ogni strategia
 */
const STRATEGY_CONFIGS: Record<CacheStrategy, CacheConfig> = {
  'athlete-profile': {
    strategy: 'athlete-profile',
    ttl: 30 * 60 * 1000, // 30 minuti (dati profilo cambiano raramente)
    staleWhileRevalidate: true,
  },
  'frequent-query': {
    strategy: 'frequent-query',
    ttl: 5 * 60 * 1000, // 5 minuti (query frequenti)
    staleWhileRevalidate: true,
  },
  stats: {
    strategy: 'stats',
    ttl: 2 * 60 * 1000, // 2 minuti (statistiche cambiano spesso)
    staleWhileRevalidate: false,
  },
  temporary: {
    strategy: 'temporary',
    ttl: 1 * 60 * 1000, // 1 minuto (dati temporanei)
    staleWhileRevalidate: false,
  },
}

/**
 * Cache Manager centralizzato
 */
class CacheManager {
  private static instance: CacheManager

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Ottiene dati dalla cache con strategia
   */
  get<T>(key: string, strategy: CacheStrategy): T | null {
    // Nota: config potrebbe essere usato in futuro per logica basata su strategia
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const config = STRATEGY_CONFIGS[strategy]
    const cacheKey = this.buildKey(key, strategy)
    return localStorageCache.get<T>(cacheKey)
  }

  /**
   * Salva dati nella cache con strategia
   */
  set<T>(key: string, data: T, strategy: CacheStrategy): void {
    const config = STRATEGY_CONFIGS[strategy]
    const cacheKey = this.buildKey(key, strategy)
    localStorageCache.set(cacheKey, data, config.ttl)
  }

  /**
   * Invalida cache per una chiave
   */
  invalidate(key: string, strategy: CacheStrategy): void {
    const cacheKey = this.buildKey(key, strategy)
    localStorageCache.delete(cacheKey)
  }

  /**
   * Invalida tutte le cache di una strategia
   */
  invalidateStrategy(strategy: CacheStrategy): void {
    if (typeof window === 'undefined') return

    try {
      const prefix = `cache_${strategy}:`
      const keysToDelete: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          keysToDelete.push(key.replace('cache_', ''))
        }
      }

      keysToDelete.forEach((key) => localStorageCache.delete(key))
    } catch (error) {
      logger.error('Error invalidating strategy', error, { strategy })
    }
  }

  /**
   * Invalida cache per pattern (es: tutti i profili atleta)
   */
  invalidatePattern(pattern: string, strategy: CacheStrategy): void {
    if (typeof window === 'undefined') return

    try {
      const prefix = `cache_${strategy}:${pattern}`
      const keysToDelete: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          keysToDelete.push(key.replace('cache_', ''))
        }
      }

      keysToDelete.forEach((key) => localStorageCache.delete(key))
    } catch (error) {
      logger.error('Error invalidating pattern', error, { pattern })
    }
  }

  /**
   * Costruisce chiave cache con strategia
   */
  private buildKey(key: string, strategy: CacheStrategy): string {
    return `${strategy}:${key}`
  }

  /**
   * Ottiene configurazione per strategia
   */
  getConfig(strategy: CacheStrategy): CacheConfig {
    return STRATEGY_CONFIGS[strategy]
  }
}

// Singleton instance
export const cacheManager = CacheManager.getInstance()

/**
 * Helper per cache profilo atleta
 */
export const athleteProfileCache = {
  get: <T>(athleteId: string, section?: string): T | null => {
    const key = section ? `athlete:${athleteId}:${section}` : `athlete:${athleteId}`
    return cacheManager.get<T>(key, 'athlete-profile')
  },

  set: <T>(athleteId: string, data: T, section?: string): void => {
    const key = section ? `athlete:${athleteId}:${section}` : `athlete:${athleteId}`
    cacheManager.set(key, data, 'athlete-profile')
  },

  invalidate: (athleteId: string, section?: string): void => {
    const key = section ? `athlete:${athleteId}:${section}` : `athlete:${athleteId}`
    cacheManager.invalidate(key, 'athlete-profile')
  },

  invalidateAll: (athleteId: string): void => {
    cacheManager.invalidatePattern(`athlete:${athleteId}`, 'athlete-profile')
  },
}

/**
 * Helper per cache query frequenti
 */
export const frequentQueryCache = {
  get: <T>(queryKey: string): T | null => {
    return cacheManager.get<T>(queryKey, 'frequent-query')
  },

  set: <T>(queryKey: string, data: T): void => {
    cacheManager.set(queryKey, data, 'frequent-query')
  },

  invalidate: (queryKey: string): void => {
    cacheManager.invalidate(queryKey, 'frequent-query')
  },
}

/**
 * Helper per cache statistiche
 */
export const statsCache = {
  get: <T>(statsKey: string): T | null => {
    return cacheManager.get<T>(statsKey, 'stats')
  },

  set: <T>(statsKey: string, data: T): void => {
    cacheManager.set(statsKey, data, 'stats')
  },

  invalidate: (statsKey: string): void => {
    cacheManager.invalidate(statsKey, 'stats')
  },

  invalidateAll: (): void => {
    cacheManager.invalidateStrategy('stats')
  },
}
