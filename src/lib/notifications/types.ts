export const NOTIFICATION_TYPES = {
  WORKOUT: 'allenamento',
  PROGRESS: 'progressi',
  SYSTEM: 'sistema',
  CHAT: 'chat',
  ATHLETE_REGISTRATION: 'athlete_registration',
  WELCOME: 'welcome',
  /** Notifiche legate ad appuntamenti (modifica/calendario) — allineato alle preferenze `appointments` */
  APPOINTMENTS: 'appuntamenti',
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export function isNotificationType(value: unknown): value is NotificationType {
  if (typeof value !== 'string') {
    return false
  }

  return (Object.values(NOTIFICATION_TYPES) as string[]).includes(value)
}
