// Sistema di logging strutturato per debug API

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  context: string
  message: string
  data?: Record<string, unknown>
  duration?: number
  status?: 'success' | 'error' | 'retry'
  retryAttempt?: number
  maxRetries?: number
}

export interface ApiCallLog {
  id: string
  startTime: number
  context: string
  endpoint?: string
  method?: string
  retryAttempts: number
  status: 'pending' | 'success' | 'error'
  error?: Error | Record<string, unknown>
  duration?: number
  data?: Record<string, unknown>
}

class ApiLogger {
  private static instance: ApiLogger
  private logs: LogEntry[] = []
  private apiCalls: Map<string, ApiCallLog> = new Map()
  private maxLogs = 1000 // Limite per evitare memory leak

  static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger()
    }
    return ApiLogger.instance
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...entry,
    }

    this.logs.push(logEntry)

    // Mantieni solo gli ultimi N log
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log in console in sviluppo
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry)
    }
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[API-${entry.level.toUpperCase()}] ${entry.context}`
    const timestamp = new Date(entry.timestamp).toLocaleTimeString()

    switch (entry.level) {
      case 'error':
        console.error(`${prefix} [${timestamp}]`, entry.message, entry.data)
        break
      case 'warn':
        console.warn(`${prefix} [${timestamp}]`, entry.message, entry.data)
        break
      case 'debug':
        console.debug(`${prefix} [${timestamp}]`, entry.message, entry.data)
        break
      default:
        console.log(`${prefix} [${timestamp}]`, entry.message, entry.data)
    }
  }

  // Log per iniziare una chiamata API
  startApiCall(context: string, endpoint?: string, method?: string): string {
    const id = this.generateId()
    const apiCall: ApiCallLog = {
      id,
      startTime: Date.now(),
      context,
      endpoint,
      method,
      retryAttempts: 0,
      status: 'pending',
    }

    this.apiCalls.set(id, apiCall)

    this.addLog({
      level: 'info',
      context,
      message: `Inizio chiamata API${endpoint ? ` a ${endpoint}` : ''}${method ? ` (${method})` : ''}`,
      data: { id, endpoint, method },
      status: 'success',
    })

    return id
  }

  // Log per tentativo di retry
  logRetry(
    callId: string,
    attempt: number,
    maxRetries: number,
    error?: Error | Record<string, unknown>,
  ): void {
    const apiCall = this.apiCalls.get(callId)
    if (!apiCall) return

    apiCall.retryAttempts = attempt

    this.addLog({
      level: 'warn',
      context: apiCall.context,
      message: `Tentativo ${attempt}/${maxRetries} fallito, riprovo...`,
      data: { callId, attempt, maxRetries, error },
      status: 'retry',
      retryAttempt: attempt,
      maxRetries,
    })
  }

  // Log per successo di chiamata API
  logApiSuccess(callId: string, data?: Record<string, unknown>): void {
    const apiCall = this.apiCalls.get(callId)
    if (!apiCall) return

    const duration = Date.now() - apiCall.startTime
    apiCall.status = 'success'
    apiCall.duration = duration
    apiCall.data = data

    this.addLog({
      level: 'info',
      context: apiCall.context,
      message: `Chiamata API completata con successo in ${duration}ms`,
      data: { callId, duration, data },
      duration,
      status: 'success',
    })

    // Rimuovi dalla mappa dopo un po' per evitare memory leak
    setTimeout(() => {
      this.apiCalls.delete(callId)
    }, 60000) // 1 minuto
  }

  // Log per errore di chiamata API
  logApiError(callId: string, error: Error | Record<string, unknown>): void {
    const apiCall = this.apiCalls.get(callId)
    if (!apiCall) return

    const duration = Date.now() - apiCall.startTime
    apiCall.status = 'error'
    apiCall.duration = duration
    apiCall.error = error

    this.addLog({
      level: 'error',
      context: apiCall.context,
      message: `Errore chiamata API dopo ${duration}ms`,
      data: { callId, duration, error },
      duration,
      status: 'error',
    })

    // Rimuovi dalla mappa dopo un po'
    setTimeout(() => {
      this.apiCalls.delete(callId)
    }, 60000) // 1 minuto
  }

  // Log generico
  log(
    level: LogEntry['level'],
    context: string,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.addLog({ level, context, message, data })
  }

  // Log per debug
  debug(context: string, message: string, data?: Record<string, unknown>): void {
    this.log('debug', context, message, data)
  }

  // Log per warning
  warn(context: string, message: string, data?: Record<string, unknown>): void {
    this.log('warn', context, message, data)
  }

  // Log per errori
  error(context: string, message: string, data?: Record<string, unknown>): void {
    this.log('error', context, message, data)
  }

  // Log per info
  info(context: string, message: string, data?: Record<string, unknown>): void {
    this.log('info', context, message, data)
  }

  // Ottieni tutti i log
  getLogs(limit?: number): LogEntry[] {
    return limit ? this.logs.slice(-limit) : [...this.logs]
  }

  // Ottieni log per livello
  getLogsByLevel(level: LogEntry['level'], limit?: number): LogEntry[] {
    const filtered = this.logs.filter((log) => log.level === level)
    return limit ? filtered.slice(-limit) : filtered
  }

  // Ottieni chiamate API attive
  getActiveApiCalls(): ApiCallLog[] {
    return Array.from(this.apiCalls.values()).filter((call) => call.status === 'pending')
  }

  // Ottieni statistiche
  getStats(): {
    totalLogs: number
    errorCount: number
    warningCount: number
    activeApiCalls: number
    recentErrors: LogEntry[]
  } {
    const now = Date.now()
    const recentErrors = this.logs.filter(
      (log) => log.level === 'error' && now - new Date(log.timestamp).getTime() < 300000, // Ultimi 5 minuti
    )

    return {
      totalLogs: this.logs.length,
      errorCount: this.logs.filter((log) => log.level === 'error').length,
      warningCount: this.logs.filter((log) => log.level === 'warn').length,
      activeApiCalls: this.apiCalls.size,
      recentErrors: recentErrors.slice(-10),
    }
  }

  // Pulisci log
  clearLogs(): void {
    this.logs = []
    this.apiCalls.clear()
  }

  // Esporta log per debugging
  exportLogs(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      apiCalls: Array.from(this.apiCalls.values()),
      stats: this.getStats(),
    }

    return JSON.stringify(exportData, null, 2)
  }
}

// Export singleton instance
export const apiLogger = ApiLogger.getInstance()

// Helper functions per uso diretto
export const logApiCall = (context: string, endpoint?: string, method?: string) => {
  return apiLogger.startApiCall(context, endpoint, method)
}

export const logApiRetry = (
  callId: string,
  attempt: number,
  maxRetries: number,
  error?: Error | Record<string, unknown>,
) => {
  apiLogger.logRetry(callId, attempt, maxRetries, error)
}

export const logApiSuccess = (callId: string, data?: Record<string, unknown>) => {
  apiLogger.logApiSuccess(callId, data)
}

export const logApiError = (callId: string, error: Error | Record<string, unknown>) => {
  apiLogger.logApiError(callId, error)
}

export const logDebug = (context: string, message: string, data?: Record<string, unknown>) => {
  apiLogger.debug(context, message, data)
}

export const logWarning = (context: string, message: string, data?: Record<string, unknown>) => {
  apiLogger.warn(context, message, data)
}

export const logError = (context: string, message: string, data?: Record<string, unknown>) => {
  apiLogger.error(context, message, data)
}

export const logInfo = (context: string, message: string, data?: Record<string, unknown>) => {
  apiLogger.info(context, message, data)
}
