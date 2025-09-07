/**
 * Logger utility for the StudyBuddy application
 * 
 * Provides structured logging with different levels and contexts
 */

interface LogContext {
  [key: string]: any
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = process.env.LOG_LEVEL || 'info'
  private isTestMode = false

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  enableTestLogging(): void {
    this.isTestMode = true
  }

  disableTestLogging(): void {
    this.isTestMode = false
  }

  error(message: string, context?: LogContext, error?: any): void {
    if (!this.shouldLog('error')) return

    const errorContext = {
      ...context,
      ...(error && {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined
        } : error
      })
    }

    console.error(this.formatMessage('error', message, errorContext))
  }

  warn(message: string, context?: LogContext, data?: any): void {
    if (!this.shouldLog('warn')) return
    const fullContext = { ...context, ...(data && { data }) }
    console.warn(this.formatMessage('warn', message, fullContext))
  }

  info(message: string, context?: LogContext, data?: any): void {
    if (!this.shouldLog('info')) return
    const fullContext = { ...context, ...(data && { data }) }
    console.info(this.formatMessage('info', message, fullContext))
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return
    console.debug(this.formatMessage('debug', message, context))
  }

  // Convenience methods for common use cases
  logRequest(request: any): LogContext {
    const context = {
      method: request.method,
      url: request.url,
      userAgent: request.headers?.get?.('user-agent') || request.headers?.['user-agent'],
      timestamp: new Date().toISOString()
    }
    
    this.info(`${request.method} ${request.url}`, context)
    return context
  }

  apiRequest(method: string, path: string, userId?: string, context?: LogContext): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      userId,
      ...context
    })
  }

  apiError(method: string, path: string, error: any, userId?: string): void {
    this.error(`API ${method} ${path} failed`, error, {
      method,
      path,
      userId
    })
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      action,
      userId,
      ...context
    })
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...context
    })
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      unit: 'ms',
      ...context
    })
  }

  // Additional methods required by the codebase
  logAPIRequest(path: string, method: string, userId?: string): LogContext {
    const context = { method, path, userId, timestamp: new Date().toISOString() }
    this.info(`API ${method} ${path}`, context)
    return context
  }

  logAPIResponse(path: string, method: string, status: number, duration: number, userId?: string): void {
    this.info(`API ${method} ${path} ${status}`, {
      method,
      path,
      status,
      duration,
      userId
    })
  }

  logResponse(context: LogContext, status: number, duration: number): void {
    this.info(`Response ${status}`, {
      ...context,
      status,
      duration,
      unit: 'ms'
    })
  }

  logDatabaseQuery(query: string, params: any[], duration: number): void {
    if (duration > 1000) {
      this.warn('Slow database query', { query, duration, params })
    } else {
      this.debug('Database query', { query, duration, params })
    }
  }

  logDatabaseError(error: any, query: string, params: any[]): void {
    this.error('Database query failed', { query, params }, error)
  }

  logLogin(userId: string, provider: string, success: boolean): void {
    this.info(`Login ${success ? 'successful' : 'failed'}`, {
      userId,
      provider,
      success
    })
  }

  logLogout(userId: string): void {
    this.info('User logout', { userId })
  }

  logSecurityEvent(event: string, severity: string, data: any): void {
    this.warn(`Security event: ${event}`, {
      event,
      severity,
      ...data,
      timestamp: new Date().toISOString()
    })
  }

  logPerformance(operation: string, duration: number): void {
    this.performance(operation, duration)
  }

  logStudySession(userId: string, sessionId: string, action: string): void {
    this.info(`Study session ${action}`, {
      userId,
      sessionId,
      action
    })
  }

  logPartnerMatch(userId: string, partnerId: string, score: number): void {
    this.info('Partner match found', {
      userId,
      partnerId,
      score
    })
  }

  logGoalProgress(userId: string, goalId: string, progress: number): void {
    this.info('Goal progress updated', {
      userId,
      goalId,
      progress
    })
  }

  logErrorWithStack(message: string, error: any): void {
    this.error(message, undefined, error)
  }

  createContext(data: any): LogContext {
    return { ...data, timestamp: new Date().toISOString() }
  }

  addToContext(baseContext: LogContext, key: string, value: any): LogContext {
    return { ...baseContext, [key]: value }
  }
}

// Export a singleton instance
export const logger = new Logger()

// Export the class for testing or custom instances
export default Logger