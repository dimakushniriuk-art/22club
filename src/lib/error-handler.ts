// Sistema centralizzato di gestione errori per API calls

import { apiLogger } from './api-logger'
import { createLogger } from './logger'

const logger = createLogger('lib:error-handler')

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, unknown>
  timestamp: string
  context?: string
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler
  private errorLog: ApiError[] = []

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler()
    }
    return ApiErrorHandler.instance
  }

  // Gestisce errori da chiamate API
  handleApiError(error: unknown, context?: string): ApiError {
    const apiError: ApiError = {
      message: this.getErrorMessage(error),
      code: this.getErrorCode(error),
      status: this.getStatusCode(error),
      details: this.getErrorDetails(error),
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
    }

    // Log dell'errore
    this.logError(apiError)

    // In produzione, invia errori a servizio di monitoring
    if (process.env.NODE_ENV === 'production') {
      this.reportError(apiError)
    }

    return apiError
  }

  // Gestisce errori da retry logic
  handleRetryError(
    error: unknown,
    attempt: number,
    maxAttempts: number,
    context?: string,
  ): ApiError {
    const apiError = this.handleApiError(error, context)
    apiError.message = `Tentativo ${attempt}/${maxAttempts} fallito: ${apiError.message}`
    return apiError
  }

  // Gestisce errori di timeout
  handleTimeoutError(timeoutMs: number, context?: string): ApiError {
    const apiError: ApiError = {
      message: `Timeout dopo ${timeoutMs}ms`,
      code: 'TIMEOUT',
      status: 408,
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
    }

    this.logError(apiError)
    return apiError
  }

  // Gestisce errori di rete
  handleNetworkError(error: unknown, context?: string): ApiError {
    const apiError = this.handleApiError(error, context)
    apiError.code = 'NETWORK_ERROR'
    apiError.message = `Errore di rete: ${apiError.message}`
    return apiError
  }

  // Gestisce errori di validazione
  handleValidationError(errors: unknown[], context?: string): ApiError {
    const apiError: ApiError = {
      message: 'Errori di validazione',
      code: 'VALIDATION_ERROR',
      status: 400,
      details: { errors },
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
    }

    this.logError(apiError)
    return apiError
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      return String(error.error.message)
    }
    return 'Errore sconosciuto'
  }

  private getErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return String(error.code)
    }
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'code' in error.error
    ) {
      return String(error.error.code)
    }
    if (error && typeof error === 'object' && 'status' in error) {
      return `HTTP_${error.status}`
    }
    return undefined
  }

  private getStatusCode(error: unknown): number | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status
    }
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      typeof error.response.status === 'number'
    ) {
      return error.response.status
    }
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'status' in error.error &&
      typeof error.error.status === 'number'
    ) {
      return error.error.status
    }
    return undefined
  }

  private getErrorDetails(error: unknown): Record<string, unknown> | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'details' in error &&
      error.details &&
      typeof error.details === 'object'
    ) {
      return error.details as Record<string, unknown>
    }
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'details' in error.error &&
      error.error.details &&
      typeof error.error.details === 'object'
    ) {
      return error.error.details as Record<string, unknown>
    }
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'data' in error.response &&
      error.response.data &&
      typeof error.response.data === 'object'
    ) {
      return error.response.data as Record<string, unknown>
    }
    return undefined
  }

  private logError(error: ApiError): void {
    this.errorLog.push(error)

    // Mantieni solo gli ultimi 100 errori
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    // Usa il nuovo sistema di logging
    apiLogger.error(error.context || 'API', error.message, {
      code: error.code,
      status: error.status,
      details: error.details,
      timestamp: error.timestamp,
    })
  }

  private reportError(error: ApiError): void {
    // In produzione, invia a servizio di monitoring (es. Sentry, LogRocket)
    logger.error('Production error', undefined, {
      message: error.message,
      code: error.code,
      status: error.status,
      timestamp: error.timestamp,
    })
  }

  // Utility per ottenere errori recenti
  getRecentErrors(limit: number = 10): ApiError[] {
    return this.errorLog.slice(-limit)
  }

  // Utility per pulire log errori
  clearErrorLog(): void {
    this.errorLog = []
  }
}

// Helper functions per uso diretto
export const handleApiError = (error: unknown, context?: string): ApiError => {
  return ApiErrorHandler.getInstance().handleApiError(error, context)
}

export const handleRetryError = (
  error: unknown,
  attempt: number,
  maxAttempts: number,
  context?: string,
): ApiError => {
  return ApiErrorHandler.getInstance().handleRetryError(error, attempt, maxAttempts, context)
}

export const handleTimeoutError = (timeoutMs: number, context?: string): ApiError => {
  return ApiErrorHandler.getInstance().handleTimeoutError(timeoutMs, context)
}

export const handleNetworkError = (error: unknown, context?: string): ApiError => {
  return ApiErrorHandler.getInstance().handleNetworkError(error, context)
}

export const handleValidationError = (errors: unknown[], context?: string): ApiError => {
  return ApiErrorHandler.getInstance().handleValidationError(errors, context)
}
