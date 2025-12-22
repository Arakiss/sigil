/**
 * Dev Overlay Log Store
 *
 * Global store for logs that persists across component re-renders.
 * Uses a pub/sub pattern for efficient updates without React state.
 */

import type { LogLevel } from 'vestig'

/**
 * Stored log entry with additional dev metadata
 */
export interface DevLogEntry {
	id: string
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
	// Dev-specific fields
	source: 'client' | 'server'
	traceId?: string
	spanId?: string
	duration?: number
}

/**
 * Filter state for log viewer
 */
export interface LogFilters {
	levels: Set<LogLevel>
	namespaces: Set<string>
	search: string
	source: 'all' | 'client' | 'server'
}

/**
 * Store state
 */
interface StoreState {
	logs: DevLogEntry[]
	filters: LogFilters
	isOpen: boolean
	maxLogs: number
}

/**
 * Store listener callback
 */
type Listener = () => void

/**
 * Create the log store
 */
function createLogStore() {
	const state: StoreState = {
		logs: [],
		filters: {
			levels: new Set(['trace', 'debug', 'info', 'warn', 'error']),
			namespaces: new Set(),
			search: '',
			source: 'all',
		},
		isOpen: false,
		maxLogs: 500,
	}

	const listeners = new Set<Listener>()

	function notify() {
		listeners.forEach((listener) => listener())
	}

	/**
	 * Generate unique log ID
	 */
	function generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	}

	return {
		/**
		 * Subscribe to store changes
		 */
		subscribe(listener: Listener): () => void {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},

		/**
		 * Get current state snapshot
		 */
		getSnapshot(): StoreState {
			return state
		},

		/**
		 * Get filtered logs
		 */
		getFilteredLogs(): DevLogEntry[] {
			return state.logs.filter((log) => {
				// Level filter
				if (!state.filters.levels.has(log.level)) return false

				// Source filter
				if (state.filters.source !== 'all' && log.source !== state.filters.source) {
					return false
				}

				// Namespace filter (if any selected)
				if (state.filters.namespaces.size > 0 && log.namespace) {
					if (!state.filters.namespaces.has(log.namespace)) return false
				}

				// Search filter
				if (state.filters.search) {
					const searchLower = state.filters.search.toLowerCase()
					const matchesMessage = log.message.toLowerCase().includes(searchLower)
					const matchesNamespace = log.namespace?.toLowerCase().includes(searchLower)
					const matchesMetadata = JSON.stringify(log.metadata ?? {})
						.toLowerCase()
						.includes(searchLower)

					if (!matchesMessage && !matchesNamespace && !matchesMetadata) {
						return false
					}
				}

				return true
			})
		},

		/**
		 * Add a log entry
		 */
		addLog(entry: Omit<DevLogEntry, 'id'>): void {
			const log: DevLogEntry = {
				...entry,
				id: generateId(),
			}

			state.logs.push(log)

			// Trim to max size (remove oldest)
			while (state.logs.length > state.maxLogs) {
				state.logs.shift()
			}

			notify()
		},

		/**
		 * Add multiple log entries (batch)
		 */
		addLogs(entries: Array<Omit<DevLogEntry, 'id'>>): void {
			for (const entry of entries) {
				state.logs.push({
					...entry,
					id: generateId(),
				})
			}

			// Trim to max size
			while (state.logs.length > state.maxLogs) {
				state.logs.shift()
			}

			notify()
		},

		/**
		 * Clear all logs
		 */
		clearLogs(): void {
			state.logs = []
			notify()
		},

		/**
		 * Toggle overlay visibility
		 */
		toggleOpen(): void {
			state.isOpen = !state.isOpen
			notify()
		},

		/**
		 * Set overlay visibility
		 */
		setOpen(isOpen: boolean): void {
			state.isOpen = isOpen
			notify()
		},

		/**
		 * Update filter levels
		 */
		setLevelFilter(level: LogLevel, enabled: boolean): void {
			if (enabled) {
				state.filters.levels.add(level)
			} else {
				state.filters.levels.delete(level)
			}
			notify()
		},

		/**
		 * Toggle all levels
		 */
		toggleAllLevels(enabled: boolean): void {
			if (enabled) {
				state.filters.levels = new Set(['trace', 'debug', 'info', 'warn', 'error'])
			} else {
				state.filters.levels.clear()
			}
			notify()
		},

		/**
		 * Set namespace filter
		 */
		setNamespaceFilter(namespace: string, enabled: boolean): void {
			if (enabled) {
				state.filters.namespaces.add(namespace)
			} else {
				state.filters.namespaces.delete(namespace)
			}
			notify()
		},

		/**
		 * Set search query
		 */
		setSearch(search: string): void {
			state.filters.search = search
			notify()
		},

		/**
		 * Set source filter
		 */
		setSourceFilter(source: 'all' | 'client' | 'server'): void {
			state.filters.source = source
			notify()
		},

		/**
		 * Get all unique namespaces from logs
		 */
		getNamespaces(): string[] {
			const namespaces = new Set<string>()
			for (const log of state.logs) {
				if (log.namespace) {
					namespaces.add(log.namespace)
				}
			}
			return Array.from(namespaces).sort()
		},

		/**
		 * Get log counts by level
		 */
		getLevelCounts(): Record<LogLevel, number> {
			const counts: Record<LogLevel, number> = {
				trace: 0,
				debug: 0,
				info: 0,
				warn: 0,
				error: 0,
			}

			for (const log of state.logs) {
				counts[log.level]++
			}

			return counts
		},
	}
}

/**
 * Singleton store instance
 */
export const logStore = createLogStore()

/**
 * Type for the store
 */
export type LogStore = ReturnType<typeof createLogStore>
