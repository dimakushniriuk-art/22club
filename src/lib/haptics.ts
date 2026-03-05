// 📱 Haptic Feedback — 22Club

import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:haptics')

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

// Pattern di vibrazione per diversi tipi di feedback
const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  light: [10],
  medium: [20, 10, 20],
  heavy: [30, 20, 30],
  success: [10, 5, 10],
  error: [50, 25, 50],
  warning: [30, 10, 30],
}

// Funzione principale per triggerare haptic feedback
export function triggerHaptic(type: HapticType = 'light'): void {
  // Verifica se siamo in un ambiente browser e se l'API è supportata
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return
  }

  // Verifica se l'utente ha disabilitato le vibrazioni
  if (navigator.vibrate === undefined) {
    return
  }

  try {
    const pattern = HAPTIC_PATTERNS[type]
    navigator.vibrate(pattern)
  } catch (error) {
    // Fallback silenzioso se la vibrazione non è supportata
    logger.debug('Haptic feedback not supported', error, { type })
  }
}

// Funzioni di convenienza per diversi tipi di azioni
export const haptics = {
  // Feedback per azioni di successo
  success: () => triggerHaptic('success'),

  // Feedback per errori
  error: () => triggerHaptic('error'),

  // Feedback per avvisi
  warning: () => triggerHaptic('warning'),

  // Feedback per interazioni leggere (hover, tap)
  light: () => triggerHaptic('light'),

  // Feedback per azioni importanti (conferme, invii)
  medium: () => triggerHaptic('medium'),

  // Feedback per azioni critiche (eliminazioni, reset)
  heavy: () => triggerHaptic('heavy'),
}

// Hook per React (opzionale)
export function useHaptics() {
  return haptics
}

// Funzione per verificare se l'haptic feedback è supportato
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator && navigator.vibrate !== undefined
}

// Funzione per richiedere permessi haptic (se necessario)
export async function requestHapticPermission(): Promise<boolean> {
  if (!isHapticSupported()) {
    return false
  }

  try {
    // Test con una vibrazione molto breve
    navigator.vibrate(1)
    return true
  } catch (error) {
    logger.debug('Haptic permission denied', error)
    return false
  }
}
