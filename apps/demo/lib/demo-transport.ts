import type { Transport, TransportConfig, LogEntry } from 'vestig'

/**
 * In-memory log storage for SSE streaming
 * This acts as a pub/sub system for real-time log delivery
 */
class LogStore {
  private logs: LogEntry[] = []
  private subscribers: Set<(entry: LogEntry) => void> = new Set()
  private maxLogs = 500

  /**
   * Add a log entry and notify all subscribers
   */
  add(entry: LogEntry): void {
    this.logs.push(entry)
    // Keep memory bounded
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
    // Notify all SSE subscribers
    this.subscribers.forEach((callback) => callback(entry))
  }

  /**
   * Subscribe to new log entries (used by SSE endpoint)
   */
  subscribe(callback: (entry: LogEntry) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Get recent logs (for initial load)
   */
  getRecent(count = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = []
  }

  /**
   * Get subscriber count (for debugging)
   */
  get subscriberCount(): number {
    return this.subscribers.size
  }
}

// Global singleton for server-side log collection
export const logStore = new LogStore()

/**
 * Demo transport configuration
 */
export interface DemoTransportConfig extends TransportConfig {
  /** Maximum logs to keep in memory (default: 500) */
  maxLogs?: number
}

/**
 * DemoTransport - A custom transport for the vestig demo app
 *
 * This transport collects logs in memory and makes them available
 * for real-time streaming via Server-Sent Events (SSE).
 *
 * Usage:
 * ```typescript
 * import { createLogger } from 'vestig'
 * import { DemoTransport } from './demo-transport'
 *
 * const logger = createLogger()
 * logger.addTransport(new DemoTransport({ name: 'demo' }))
 * ```
 */
export class DemoTransport implements Transport {
  readonly name: string
  readonly config: DemoTransportConfig

  constructor(config: DemoTransportConfig) {
    this.name = config.name
    this.config = config
  }

  /**
   * Log entry - adds to the global store for SSE streaming
   */
  log(entry: LogEntry): void {
    // Add unique ID for React keys
    const entryWithId = {
      ...entry,
      id: `${entry.timestamp}-${Math.random().toString(36).slice(2, 9)}`,
    }
    logStore.add(entryWithId as LogEntry)
  }

  async flush(): Promise<void> {
    // No buffering, logs are immediately added to store
  }

  async destroy(): Promise<void> {
    // Nothing to cleanup
  }
}

/**
 * Extended log entry with unique ID for UI rendering
 */
export interface DemoLogEntry extends LogEntry {
  id: string
}

/**
 * Create an SSE stream for log entries
 * Used by the /api/logs route to stream logs to the client
 */
export function createLogStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      // Send recent logs first
      const recentLogs = logStore.getRecent()
      for (const entry of recentLogs) {
        const data = `data: ${JSON.stringify(entry)}\n\n`
        controller.enqueue(new TextEncoder().encode(data))
      }

      // Subscribe to new logs
      const unsubscribe = logStore.subscribe((entry) => {
        try {
          const data = `data: ${JSON.stringify(entry)}\n\n`
          controller.enqueue(new TextEncoder().encode(data))
        } catch {
          // Stream closed
          unsubscribe()
        }
      })

      // Cleanup on close - we can't detect close directly in ReadableStream
      // The connection cleanup happens when the client disconnects
    },
    cancel() {
      // Stream was cancelled
    },
  })
}

/**
 * Helper to post logs from client-side to the server
 * Used when logging from browser/client components
 */
export async function postLogToServer(entry: LogEntry): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  } catch {
    // Silently fail - we don't want logging to break the app
    console.warn('[vestig-demo] Failed to post log to server')
  }
}

/**
 * Client-side transport that posts logs to the server
 * This allows client-side logs to appear in the unified log viewer
 */
export class ClientDemoTransport implements Transport {
  readonly name: string
  readonly config: TransportConfig

  constructor(name = 'client-demo') {
    this.name = name
    this.config = { name }
  }

  log(entry: LogEntry): void {
    // Fire and forget - don't await
    postLogToServer(entry)
  }

  async flush(): Promise<void> {}
  async destroy(): Promise<void> {}
}
