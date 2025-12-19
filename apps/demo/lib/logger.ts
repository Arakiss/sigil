import {
  createLogger,
  RUNTIME,
  IS_SERVER,
  type LoggerConfig,
  type LogLevel,
} from 'vestig'
import { DemoTransport, ClientDemoTransport } from './demo-transport'

/**
 * Shared logger configuration for the demo app
 * Configured to show all log levels for demonstration purposes
 */
const baseConfig: LoggerConfig = {
  level: 'trace' as LogLevel,
  sanitize: 'default',
  context: {
    app: 'vestig-demo',
    runtime: RUNTIME,
  },
}

/**
 * Server-side logger with structured JSON output
 * Used in Server Components, API Routes, Server Actions, and Edge Middleware
 *
 * Includes DemoTransport to send logs to the UI for real-time viewing
 */
export const serverLogger = createLogger({
  ...baseConfig,
  structured: true,
  namespace: 'server',
})

// Add demo transport for real-time log viewing
serverLogger.addTransport(new DemoTransport({ name: 'demo' }))

/**
 * Create a client-side logger instance
 * Uses pretty console output for better DX in browser devtools
 * Includes ClientDemoTransport to send logs to server for unified viewing
 */
export function createClientLogger(namespace?: string) {
  const logger = createLogger({
    ...baseConfig,
    structured: false,
    namespace: namespace ?? 'client',
  })

  // Add client demo transport to send logs to server
  logger.addTransport(new ClientDemoTransport())

  return logger
}

/**
 * Get the appropriate logger based on environment
 * Automatically detects server vs client and returns configured instance
 */
export function getLogger(namespace?: string) {
  if (IS_SERVER) {
    return namespace ? serverLogger.child(namespace) : serverLogger
  }
  return createClientLogger(namespace)
}

/**
 * Re-export commonly used items for convenience
 */
export { RUNTIME, IS_SERVER } from 'vestig'
