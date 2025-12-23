/**
 * Dev Overlay Log Store
 *
 * Simple pub/sub store for dev logs.
 * Uses class-based architecture for clarity and reliability.
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
export interface LogStoreState {
	logs: DevLogEntry[]
	filters: LogFilters
	isOpen: boolean
	maxLogs: number
}

type Listener = () => void

/**
 * Simple log store - no useSyncExternalStore needed
 */
class SimpleLogStore {
	private state: LogStoreState = {
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

	private listeners = new Set<Listener>()

	/**
	 * Subscribe to store changes
	 */
	subscribe(listener: Listener): () => void {
		this.listeners.add(listener)
		return () => this.listeners.delete(listener)
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener()
			} catch (error) {
				console.error('[vestig-dev] Listener error:', error)
			}
		}
	}

	/**
	 * Get current state snapshot
	 */
	getSnapshot(): LogStoreState {
		return this.state
	}

	/**
	 * Get filtered logs
	 */
	getFilteredLogs(): DevLogEntry[] {
		return this.state.logs.filter((log) => {
			if (!this.state.filters.levels.has(log.level)) return false

			if (this.state.filters.source !== 'all' && log.source !== this.state.filters.source) {
				return false
			}

			if (this.state.filters.namespaces.size > 0 && log.namespace) {
				if (!this.state.filters.namespaces.has(log.namespace)) return false
			}

			if (this.state.filters.search) {
				const searchLower = this.state.filters.search.toLowerCase()
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
	}

	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
	}

	/**
	 * Add a log entry
	 */
	addLog(entry: Omit<DevLogEntry, 'id'>): void {
		const log: DevLogEntry = {
			...entry,
			id: this.generateId(),
		}

		this.state.logs.push(log)

		while (this.state.logs.length > this.state.maxLogs) {
			this.state.logs.shift()
		}

		this.notify()
	}

	/**
	 * Add multiple log entries
	 */
	addLogs(entries: Array<Omit<DevLogEntry, 'id'>>): void {
		for (const entry of entries) {
			this.state.logs.push({
				...entry,
				id: this.generateId(),
			})
		}

		while (this.state.logs.length > this.state.maxLogs) {
			this.state.logs.shift()
		}

		this.notify()
	}

	/**
	 * Clear all logs
	 */
	clearLogs(): void {
		this.state.logs = []
		this.notify()
	}

	/**
	 * Toggle overlay visibility
	 */
	toggleOpen(): void {
		this.state.isOpen = !this.state.isOpen
		this.notify()
	}

	/**
	 * Set overlay visibility
	 */
	setOpen(isOpen: boolean): void {
		this.state.isOpen = isOpen
		this.notify()
	}

	/**
	 * Update filter levels
	 */
	setLevelFilter(level: LogLevel, enabled: boolean): void {
		if (enabled) {
			this.state.filters.levels.add(level)
		} else {
			this.state.filters.levels.delete(level)
		}
		this.notify()
	}

	/**
	 * Toggle all levels
	 */
	toggleAllLevels(enabled: boolean): void {
		if (enabled) {
			this.state.filters.levels = new Set(['trace', 'debug', 'info', 'warn', 'error'])
		} else {
			this.state.filters.levels.clear()
		}
		this.notify()
	}

	/**
	 * Set namespace filter
	 */
	setNamespaceFilter(namespace: string, enabled: boolean): void {
		if (enabled) {
			this.state.filters.namespaces.add(namespace)
		} else {
			this.state.filters.namespaces.delete(namespace)
		}
		this.notify()
	}

	/**
	 * Set search query
	 */
	setSearch(search: string): void {
		this.state.filters.search = search
		this.notify()
	}

	/**
	 * Set source filter
	 */
	setSourceFilter(source: 'all' | 'client' | 'server'): void {
		this.state.filters.source = source
		this.notify()
	}

	/**
	 * Get all unique namespaces
	 */
	getNamespaces(): string[] {
		const namespaces = new Set<string>()
		for (const log of this.state.logs) {
			if (log.namespace) {
				namespaces.add(log.namespace)
			}
		}
		return Array.from(namespaces).sort()
	}

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

		for (const log of this.state.logs) {
			counts[log.level]++
		}

		return counts
	}
}

/**
 * Singleton store instance
 */
export const logStore = new SimpleLogStore()

/**
 * Type for the store
 */
export type LogStore = SimpleLogStore
