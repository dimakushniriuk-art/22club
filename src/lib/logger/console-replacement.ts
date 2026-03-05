/**
 * Sostituzione diretta di console.log/error/warn
 * Per migrazione graduale senza breaking changes
 */

import { logger } from './index'

/**
 * Sostituisce console.log con logger.info
 */
export const consoleLog = (...args: unknown[]): void => {
  const [first, ...rest] = args
  const message = typeof first === 'string' ? first : JSON.stringify(first)
  const data = rest.length > 0 ? { additional: rest } : undefined
  logger.info('Console', message, data)
}

/**
 * Sostituisce console.error con logger.error
 */
export const consoleError = (...args: unknown[]): void => {
  const [first, ...rest] = args
  const message = typeof first === 'string' ? first : JSON.stringify(first)
  const error = first instanceof Error ? first : undefined
  const data = rest.length > 0 ? { additional: rest } : undefined
  logger.error('Console', message, error, data)
}

/**
 * Sostituisce console.warn con logger.warn
 */
export const consoleWarn = (...args: unknown[]): void => {
  const [first, ...rest] = args
  const message = typeof first === 'string' ? first : JSON.stringify(first)
  const data = rest.length > 0 ? { additional: rest } : undefined
  logger.warn('Console', message, data)
}

/**
 * Sostituisce console.info con logger.info
 */
export const consoleInfo = (...args: unknown[]): void => {
  const [first, ...rest] = args
  const message = typeof first === 'string' ? first : JSON.stringify(first)
  const data = rest.length > 0 ? { additional: rest } : undefined
  logger.info('Console', message, data)
}

/**
 * Sostituisce console.debug con logger.debug
 */
export const consoleDebug = (...args: unknown[]): void => {
  const [first, ...rest] = args
  const message = typeof first === 'string' ? first : JSON.stringify(first)
  const data = rest.length > 0 ? { additional: rest } : undefined
  logger.debug('Console', message, data)
}
