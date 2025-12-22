/**
 * SSE Endpoint Helper for Vestig Dev Overlay
 *
 * This module provides utilities for creating a Server-Sent Events
 * endpoint that streams logs to the Dev Overlay in real-time.
 *
 * @example
 * ```typescript
 * // app/api/vestig/logs/route.ts
 * import { createLogStreamHandler, devLogEmitter } from '@vestig/next/dev/api'
 *
 * export const GET = createLogStreamHandler()
 *
 * // In your middleware or logger setup
 * devLogEmitter.emit({
 *   timestamp: new Date().toISOString(),
 *   level: 'info',
 *   message: 'Hello from server',
 *   namespace: 'api',
 * })
 * ```
 */

import type { LogLevel } from 'vestig'

/**
 * Log entry for SSE streaming
 */
export interface SSELogEntry {
	timestamp: string
	level: LogLevel
	message: string
	namespace?: string
	metadata?: Record<string, unknown>
	context?: Record<string, unknown>
	error?: {
		name: string
		message: string
		stack?: string
	}
	duration?: number
}

/**
 * Simple event emitter for logs
 */
type LogListener = (entry: SSELogEntry) => void

class DevLogEmitter {
	private listeners = new Set<LogListener>()

	/**
	 * Subscribe to log events
	 */
	subscribe(listener: LogListener): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	/**
	 * Emit a log entry to all subscribers
	 */
	emit(entry: SSELogEntry): void {
		for (const listener of this.listeners) {
			try {
				listener(entry)
			} catch (error) {
				console.error('[vestig-dev] Log listener error:', error)
			}
		}
	}

	/**
	 * Get count of active listeners
	 */
	get listenerCount(): number {
		return this.listeners.size
	}
}

/**
 * Singleton log emitter instance
 */
export const devLogEmitter = new DevLogEmitter()

/**
 * Create an SSE response for streaming logs
 *
 * @example
 * ```typescript
 * // app/api/vestig/logs/route.ts
 * import { createLogStreamHandler } from '@vestig/next/dev/api'
 *
 * export const GET = createLogStreamHandler()
 * ```
 */
export function createLogStreamHandler(options?: {
	/**
	 * Send a ping every N milliseconds to keep connection alive
	 * @default 30000
	 */
	pingInterval?: number
}) {
	const { pingInterval = 30000 } = options ?? {}

	return async function handler(): Promise<Response> {
		const encoder = new TextEncoder()
		let pingTimer: ReturnType<typeof setInterval> | null = null
		let unsubscribe: (() => void) | null = null

		const stream = new ReadableStream({
			start(controller) {
				// Send initial connection message
				controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

				// Subscribe to log events
				unsubscribe = devLogEmitter.subscribe((entry) => {
					try {
						const data = JSON.stringify({ type: 'log', ...entry })
						controller.enqueue(encoder.encode(`data: ${data}\n\n`))
					} catch (error) {
						console.error('[vestig-dev] SSE write error:', error)
					}
				})

				// Send periodic pings to keep connection alive
				pingTimer = setInterval(() => {
					try {
						controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping' })}\n\n`))
					} catch {
						// Connection closed
						if (pingTimer) clearInterval(pingTimer)
					}
				}, pingInterval)
			},

			cancel() {
				if (pingTimer) {
					clearInterval(pingTimer)
					pingTimer = null
				}
				if (unsubscribe) {
					unsubscribe()
					unsubscribe = null
				}
			},
		})

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache, no-transform',
				Connection: 'keep-alive',
				'X-Accel-Buffering': 'no', // Disable nginx buffering
			},
		})
	}
}

/**
 * Create a vestig transport that streams logs to Dev Overlay
 *
 * @example
 * ```typescript
 * import { createLogger } from 'vestig'
 * import { createDevTransport } from '@vestig/next/dev/api'
 *
 * const logger = createLogger({
 *   // Only add dev transport in development
 *   transports: process.env.NODE_ENV === 'development'
 *     ? [createDevTransport()]
 *     : [],
 * })
 * ```
 */
export function createDevTransport() {
	return {
		name: 'vestig-dev-overlay',
		config: {
			name: 'vestig-dev-overlay',
			enabled: true,
		},

		log(entry: {
			timestamp: string
			level: LogLevel
			message: string
			namespace?: string
			metadata?: Record<string, unknown>
			context?: Record<string, unknown>
			error?: {
				name: string
				message: string
				stack?: string
			}
		}): void {
			devLogEmitter.emit({
				timestamp: entry.timestamp,
				level: entry.level,
				message: entry.message,
				namespace: entry.namespace,
				metadata: entry.metadata,
				context: entry.context,
				error: entry.error,
			})
		},
	}
}
