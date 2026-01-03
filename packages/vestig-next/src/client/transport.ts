'use client'

import type { LogEntry, Transport, TransportConfig } from 'vestig'

/**
 * Configuration for offline queue persistence
 */
export interface OfflineQueueConfig {
	/** Enable offline queue persistence (default: true) */
	enabled?: boolean
	/** localStorage key for persisted queue (default: 'vestig:offline-queue') */
	storageKey?: string
	/** Maximum entries to persist (default: 1000) */
	maxSize?: number
	/** Callback when queue is restored from storage */
	onRestore?: (count: number) => void
	/** Callback when queue is persisted to storage */
	onPersist?: (count: number) => void
}

/**
 * Configuration for ClientHTTPTransport
 */
export interface ClientHTTPTransportConfig extends TransportConfig {
	/** Server endpoint URL (default: '/api/vestig') */
	url: string
	/** Batch size before auto-flush (default: 20) */
	batchSize?: number
	/** Flush interval in ms (default: 3000) */
	flushInterval?: number
	/** Max retry attempts (default: 3) */
	maxRetries?: number
	/** Retry delay in ms (default: 1000) */
	retryDelay?: number
	/** Callback on successful flush */
	onFlushSuccess?: () => void
	/** Callback on flush error */
	onFlushError?: (error: Error) => void
	/** Callback when logs are dropped */
	onDrop?: (count: number) => void
	/** Offline queue configuration for persistence */
	offlineQueue?: OfflineQueueConfig
}

/**
 * HTTP transport for client-side log batching
 *
 * Features:
 * - Automatic batching with configurable size and interval
 * - Retry with exponential backoff
 * - Uses keepalive for beforeunload reliability
 * - Automatic page metadata enrichment
 * - Offline queue persistence with localStorage
 */
export class ClientHTTPTransport implements Transport {
	readonly name: string
	readonly config: TransportConfig

	private url: string
	private batchSize: number
	private flushInterval: number
	private maxRetries: number
	private retryDelay: number
	private onFlushSuccess?: () => void
	private onFlushError?: (error: Error) => void
	private onDrop?: (count: number) => void

	// Offline queue config
	private offlineEnabled: boolean
	private offlineStorageKey: string
	private offlineMaxSize: number
	private onOfflineRestore?: (count: number) => void
	private onOfflinePersist?: (count: number) => void

	private buffer: LogEntry[] = []
	private flushTimer: ReturnType<typeof setInterval> | null = null
	private isFlushing = false
	private isDestroyed = false
	private maxBufferSize = 500
	private isOnline = true
	private boundOnlineHandler: () => void
	private boundOfflineHandler: () => void
	private flushQueue: Promise<void> = Promise.resolve()
	private pendingFlush = false

	constructor(config: ClientHTTPTransportConfig) {
		this.name = config.name
		this.config = { name: config.name, enabled: config.enabled ?? true }
		this.url = config.url
		this.batchSize = config.batchSize ?? 20
		this.flushInterval = config.flushInterval ?? 3000
		this.maxRetries = config.maxRetries ?? 3
		this.retryDelay = config.retryDelay ?? 1000
		this.onFlushSuccess = config.onFlushSuccess
		this.onFlushError = config.onFlushError
		this.onDrop = config.onDrop

		// Offline queue settings
		const offlineConfig = config.offlineQueue ?? {}
		this.offlineEnabled = offlineConfig.enabled ?? true
		this.offlineStorageKey = offlineConfig.storageKey ?? 'vestig:offline-queue'
		this.offlineMaxSize = offlineConfig.maxSize ?? 1000
		this.onOfflineRestore = offlineConfig.onRestore
		this.onOfflinePersist = offlineConfig.onPersist

		// Initialize network status (default to true if navigator.onLine is not available)
		this.isOnline =
			typeof navigator !== 'undefined' && navigator.onLine !== undefined ? navigator.onLine : true

		// Bind handlers for cleanup
		this.boundOnlineHandler = this.handleOnline.bind(this)
		this.boundOfflineHandler = this.handleOffline.bind(this)
	}

	async init(): Promise<void> {
		// Restore offline queue if any
		if (this.offlineEnabled) {
			this.restoreOfflineQueue()
		}

		// Listen for network status changes
		if (typeof window !== 'undefined') {
			window.addEventListener('online', this.boundOnlineHandler)
			window.addEventListener('offline', this.boundOfflineHandler)
		}

		// Start flush timer
		this.flushTimer = setInterval(() => {
			this.flush()
		}, this.flushInterval)
	}

	private handleOnline(): void {
		this.isOnline = true
		// Attempt to flush when back online
		this.flush()
	}

	private handleOffline(): void {
		this.isOnline = false
		// Persist current buffer to offline storage
		if (this.offlineEnabled && this.buffer.length > 0) {
			this.persistOfflineQueue()
		}
	}

	private restoreOfflineQueue(): void {
		if (typeof localStorage === 'undefined') return

		try {
			const stored = localStorage.getItem(this.offlineStorageKey)
			if (!stored) return

			const entries: LogEntry[] = JSON.parse(stored)
			if (!Array.isArray(entries) || entries.length === 0) return

			// Add restored entries to the front of the buffer
			this.buffer.unshift(...entries)

			// Enforce max buffer size
			if (this.buffer.length > this.maxBufferSize) {
				const excess = this.buffer.length - this.maxBufferSize
				this.buffer.splice(this.maxBufferSize)
				this.onDrop?.(excess)
			}

			// Clear stored queue
			localStorage.removeItem(this.offlineStorageKey)

			this.onOfflineRestore?.(entries.length)
		} catch {
			// Silently ignore parsing errors
		}
	}

	private persistOfflineQueue(): void {
		if (typeof localStorage === 'undefined') return

		try {
			// Merge existing stored entries with current buffer
			let toStore: LogEntry[] = [...this.buffer]

			const existingStored = localStorage.getItem(this.offlineStorageKey)
			if (existingStored) {
				try {
					const existing: LogEntry[] = JSON.parse(existingStored)
					if (Array.isArray(existing)) {
						toStore = [...existing, ...toStore]
					}
				} catch {
					// Ignore parse errors
				}
			}

			// Enforce max size
			if (toStore.length > this.offlineMaxSize) {
				const excess = toStore.length - this.offlineMaxSize
				toStore = toStore.slice(excess)
				this.onDrop?.(excess)
			}

			this.safeLocalStorageSet(this.offlineStorageKey, JSON.stringify(toStore))
			this.onOfflinePersist?.(toStore.length)
		} catch {
			// Silently ignore storage errors
		}
	}

	/**
	 * Safely set localStorage with quota handling
	 * Removes oldest entries if quota is exceeded
	 */
	private safeLocalStorageSet(key: string, value: string): boolean {
		try {
			localStorage.setItem(key, value)
			return true
		} catch (error) {
			// Handle QuotaExceededError
			if (
				error instanceof Error &&
				(error.name === 'QuotaExceededError' ||
					error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
					// Safari private browsing
					error.message.includes('quota'))
			) {
				// Try to make room by reducing stored entries
				try {
					const parsed: LogEntry[] = JSON.parse(value)
					if (Array.isArray(parsed) && parsed.length > 1) {
						// Remove half the entries and try again
						const reduced = parsed.slice(Math.floor(parsed.length / 2))
						const droppedCount = parsed.length - reduced.length
						this.onDrop?.(droppedCount)

						if (reduced.length > 0) {
							return this.safeLocalStorageSet(key, JSON.stringify(reduced))
						}
					}
				} catch {
					// Parse failed, clear the key entirely
					localStorage.removeItem(key)
				}
			}
			return false
		}
	}

	log(entry: LogEntry): void {
		if (this.isDestroyed) return

		// Enrich with client metadata
		const enrichedEntry: LogEntry = {
			...entry,
			metadata: {
				...entry.metadata,
				_client: {
					url: typeof window !== 'undefined' ? window.location.href : undefined,
					pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
					userAgent:
						typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : undefined,
				},
			},
		}

		// Check buffer size
		if (this.buffer.length >= this.maxBufferSize) {
			// Drop oldest entries
			const dropCount = Math.floor(this.maxBufferSize / 4)
			this.buffer.splice(0, dropCount)
			this.onDrop?.(dropCount)
		}

		this.buffer.push(enrichedEntry)

		// Auto-flush if batch size reached
		if (this.buffer.length >= this.batchSize) {
			this.flush()
		}
	}

	async flush(): Promise<void> {
		if (this.buffer.length === 0 || this.isDestroyed) {
			return
		}

		// If offline, persist to storage instead of sending
		if (!this.isOnline) {
			if (this.offlineEnabled) {
				this.persistOfflineQueue()
			}
			return
		}

		// If already flushing, queue this flush request
		if (this.isFlushing) {
			if (!this.pendingFlush) {
				this.pendingFlush = true
				this.flushQueue = this.flushQueue.then(() => {
					this.pendingFlush = false
					return this.doFlush()
				})
			}
			return this.flushQueue
		}

		return this.doFlush()
	}

	private async doFlush(): Promise<void> {
		if (this.buffer.length === 0 || this.isDestroyed || this.isFlushing) {
			return
		}

		this.isFlushing = true
		const entries = [...this.buffer]
		this.buffer = []

		try {
			await this.sendWithRetry(entries)
			this.onFlushSuccess?.()
		} catch (error) {
			// Re-add failed entries to buffer (at the front)
			this.buffer.unshift(...entries)

			// Trim if buffer is too large
			if (this.buffer.length > this.maxBufferSize) {
				const excess = this.buffer.length - this.maxBufferSize
				this.buffer.splice(this.maxBufferSize)
				this.onDrop?.(excess)
			}

			// If send failed, might be network issue - persist to offline queue
			if (this.offlineEnabled) {
				this.persistOfflineQueue()
			}

			this.onFlushError?.(error instanceof Error ? error : new Error(String(error)))
		} finally {
			this.isFlushing = false
		}
	}

	private async sendWithRetry(entries: LogEntry[]): Promise<void> {
		let lastError: Error | null = null

		for (let attempt = 0; attempt < this.maxRetries; attempt++) {
			try {
				const response = await fetch(this.url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ entries }),
					keepalive: true, // Important for beforeunload
				})

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`)
				}

				return
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error))

				// Don't retry on last attempt
				if (attempt < this.maxRetries - 1) {
					// Exponential backoff
					await new Promise((r) => setTimeout(r, this.retryDelay * 2 ** attempt))
				}
			}
		}

		throw lastError
	}

	async destroy(): Promise<void> {
		this.isDestroyed = true

		// Remove network event listeners
		if (typeof window !== 'undefined') {
			window.removeEventListener('online', this.boundOnlineHandler)
			window.removeEventListener('offline', this.boundOfflineHandler)
		}

		if (this.flushTimer) {
			clearInterval(this.flushTimer)
			this.flushTimer = null
		}

		// Persist remaining buffer to offline storage
		if (this.offlineEnabled && this.buffer.length > 0) {
			this.persistOfflineQueue()
		}

		// Final flush attempt if online
		if (this.buffer.length > 0 && this.isOnline) {
			this.isFlushing = false // Reset to allow final flush
			await this.flush()
		}
	}

	/**
	 * Get current online status
	 */
	getOnlineStatus(): boolean {
		return this.isOnline
	}

	/**
	 * Get current buffer size
	 */
	getBufferSize(): number {
		return this.buffer.length
	}

	/**
	 * Manually trigger offline queue persistence
	 */
	persistNow(): void {
		if (this.offlineEnabled) {
			this.persistOfflineQueue()
		}
	}
}

/**
 * Create a client HTTP transport with default configuration
 */
export function createClientTransport(
	options: Partial<ClientHTTPTransportConfig> = {},
): ClientHTTPTransport {
	return new ClientHTTPTransport({
		name: 'vestig-client',
		url: '/api/vestig',
		...options,
	})
}
