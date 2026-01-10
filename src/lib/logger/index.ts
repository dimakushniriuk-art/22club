/**
 * Logger Strutturato per 22Club
 * Sostituisce console.log/error/warn con sistema strutturato
 * Supporta log levels, formattazione, e rimozione in produzione
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  context: string
  message: string
  data?: Record<string, unknown>
  error?: Error
  stack?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableProduction: boolean
  maxLogs: number
  context?: string
}

/**
 * Helper per distinguere Error da Record<string, unknown>
 * Un Error è sempre instanceof Error o ha message/stack come string
 * Un Record<string, unknown> tipicamente non ha queste proprietà come string
 */
function isErrorLike(
  value: unknown,
): value is Error | (Error & { message: string; stack: string }) {
  if (value instanceof Error) {
    return true
  }
  if (value === null || value === undefined || typeof value !== 'object') {
    return false
  }
  // Controlla se ha proprietà tipiche di un Error
  const obj = value as Record<string, unknown>
  return (
    'message' in obj &&
    'stack' in obj &&
    typeof obj.message === 'string' &&
    typeof obj.stack === 'string'
  )
}

class Logger {
  private static instance: Logger
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private logRotationEnabled = false

  private constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const logLevel =
      (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || (isDevelopment ? 'debug' : 'warn')

    this.config = {
      level: logLevel,
      enableConsole: isDevelopment,
      enableProduction: process.env.NEXT_PUBLIC_ENABLE_PRODUCTION_LOGS === 'true',
      maxLogs: 1000,
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Configura il logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Abilita/disabilita log rotation
   */
  setLogRotation(enabled: boolean): void {
    this.logRotationEnabled = enabled
  }

  /**
   * Verifica se un livello di log deve essere processato
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const logLevelIndex = levels.indexOf(level)

    return logLevelIndex >= currentLevelIndex
  }

  /**
   * Aggiunge un log entry
   */
  private addLog(entry: Omit<LogEntry, 'timestamp'>): void {
    if (!this.shouldLog(entry.level)) {
      return
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    }

    // Aggiungi a memoria (solo in sviluppo o se abilitato)
    if (this.config.enableConsole || this.config.enableProduction) {
      this.logs.push(logEntry)

      // Log rotation
      if (this.logRotationEnabled && this.logs.length > this.config.maxLogs) {
        this.logs = this.logs.slice(-this.config.maxLogs)
      }
    }

    // Output su console (solo in sviluppo o se abilitato)
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }
  }

  /**
   * Log su console con formattazione
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`
    const context = entry.context ? `[${entry.context}]` : ''
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()

    const style = this.getConsoleStyle(entry.level)
    const message = `${prefix} ${context} ${entry.message}`

    const args: unknown[] = [`%c${timestamp} ${message}`, style]

    if (entry.data) {
      args.push(entry.data)
    }

    if (entry.error) {
      args.push(entry.error)
    }

    if (entry.stack) {
      args.push(`\n${entry.stack}`)
    }

    // Usa il metodo console appropriato
    switch (entry.level) {
      case 'debug':
        console.debug(...args)
        break
      case 'info':
        console.info(...args)
        break
      case 'warn':
        console.warn(...args)
        break
      case 'error':
        console.error(...args)
        break
    }
  }

  /**
   * Ottiene lo stile console per il livello
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #6B7280; font-weight: normal',
      info: 'color: #3B82F6; font-weight: normal',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
    }
    return styles[level]
  }

  /**
   * Crea un logger con contesto specifico
   */
  createLogger(context: string): LoggerInstance {
    return new LoggerInstance(context, this)
  }

  /**
   * Metodi pubblici per logging
   * Supportano sia (context, message, data) che (context, message, error, data)
   */
  debug(
    context: string,
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    if (errorOrData !== undefined && isErrorLike(errorOrData)) {
      const errorObj = errorOrData instanceof Error ? errorOrData : new Error(String(errorOrData))
      const errorData = data || {}
      this.addLog({
        level: 'debug',
        context,
        message,
        error: errorObj,
        stack: errorObj.stack,
        data: errorData,
      })
    } else {
      this.addLog({
        level: 'debug',
        context,
        message,
        data: errorOrData as Record<string, unknown> | undefined,
      })
    }
  }

  info(
    context: string,
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    if (errorOrData !== undefined && isErrorLike(errorOrData)) {
      const errorObj = errorOrData instanceof Error ? errorOrData : new Error(String(errorOrData))
      const errorData = data || {}
      this.addLog({
        level: 'info',
        context,
        message,
        error: errorObj,
        stack: errorObj.stack,
        data: errorData,
      })
    } else {
      this.addLog({
        level: 'info',
        context,
        message,
        data: errorOrData as Record<string, unknown> | undefined,
      })
    }
  }

  warn(
    context: string,
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    if (errorOrData !== undefined && isErrorLike(errorOrData)) {
      const errorObj = errorOrData instanceof Error ? errorOrData : new Error(String(errorOrData))
      const errorData = data || {}
      this.addLog({
        level: 'warn',
        context,
        message,
        error: errorObj,
        stack: errorObj.stack,
        data: errorData,
      })
    } else {
      this.addLog({
        level: 'warn',
        context,
        message,
        data: errorOrData as Record<string, unknown> | undefined,
      })
    }
  }

  error(
    context: string,
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>,
  ): void {
    const errorObj = error instanceof Error ? error : undefined
    const stack = errorObj?.stack

    this.addLog({
      level: 'error',
      context,
      message,
      error: errorObj,
      stack,
      data,
    })
  }

  /**
   * Ottiene tutti i log (per debugging)
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level)
    }
    return [...this.logs]
  }

  /**
   * Pulisce i log
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Esporta log come JSON (per debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

/**
 * Istanza logger con contesto
 */
class LoggerInstance {
  constructor(
    private context: string,
    private logger: Logger,
  ) {}

  // Overload per debug
  debug(message: string): void
  debug(message: string, data: Record<string, unknown>): void
  debug(message: string, error: Error | unknown, data?: Record<string, unknown>): void
  debug(
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    this.logger.debug(this.context, message, errorOrData, data)
  }

  // Overload per info
  info(message: string): void
  info(message: string, data: Record<string, unknown>): void
  info(message: string, error: Error | unknown, data?: Record<string, unknown>): void
  info(
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    this.logger.info(this.context, message, errorOrData, data)
  }

  // Overload per warn
  warn(message: string): void
  warn(message: string, data: Record<string, unknown>): void
  warn(message: string, error: Error | unknown, data?: Record<string, unknown>): void
  warn(
    message: string,
    errorOrData?: Error | unknown | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    this.logger.warn(this.context, message, errorOrData, data)
  }

  // error già supporta tutti i casi
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    this.logger.error(this.context, message, error, data)
  }
}

// Singleton instance
const logger = Logger.getInstance()

// Export singleton e factory
export { logger, Logger }

// Export helper per creare logger con contesto
export function createLogger(context: string): LoggerInstance {
  return logger.createLogger(context)
}

// Export funzioni dirette per compatibilità
export const logDebug = (context: string, message: string, data?: Record<string, unknown>) =>
  logger.debug(context, message, data)
export const logInfo = (context: string, message: string, data?: Record<string, unknown>) =>
  logger.info(context, message, data)
export const logWarn = (context: string, message: string, data?: Record<string, unknown>) =>
  logger.warn(context, message, data)
export const logError = (
  context: string,
  message: string,
  error?: Error | unknown,
  data?: Record<string, unknown>,
) => logger.error(context, message, error, data)
