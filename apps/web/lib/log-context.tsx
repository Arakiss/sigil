'use client'

import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
} from 'react'
import type { LogLevel, Runtime } from 'vestig'
import type { DemoLogEntry } from './demo-transport'

/**
 * Filter configuration for log viewer
 */
export interface LogFilter {
	levels: Set<LogLevel>
	runtimes: Set<Runtime | 'unknown'>
	search: string
	namespace?: string
}

/**
 * Connection state for SSE
 */
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Log context state
 */
interface LogState {
	logs: DemoLogEntry[]
	filter: LogFilter
	connectionStatus: ConnectionStatus
	isPanelOpen: boolean
	autoScroll: boolean
	maxLogs: number
	reconnectAttempts: number
	lastError: string | null
}

/**
 * Available actions for log state
 */
type LogAction =
	| { type: 'ADD_LOG'; payload: DemoLogEntry }
	| { type: 'ADD_LOGS'; payload: DemoLogEntry[] }
	| { type: 'CLEAR_LOGS' }
	| { type: 'SET_FILTER'; payload: Partial<LogFilter> }
	| { type: 'SET_CONNECTION_STATUS'; payload: ConnectionStatus }
	| { type: 'SET_ERROR'; payload: string }
	| { type: 'INCREMENT_RECONNECT' }
	| { type: 'RESET_RECONNECT' }
	| { type: 'TOGGLE_PANEL' }
	| { type: 'SET_PANEL_OPEN'; payload: boolean }
	| { type: 'TOGGLE_AUTO_SCROLL' }

const ALL_LEVELS: Set<LogLevel> = new Set(['trace', 'debug', 'info', 'warn', 'error'])
const ALL_RUNTIMES: Set<Runtime | 'unknown'> = new Set([
	'node',
	'bun',
	'edge',
	'browser',
	'worker',
	'unknown',
])

const initialFilter: LogFilter = {
	levels: ALL_LEVELS,
	runtimes: ALL_RUNTIMES,
	search: '',
}

const initialState: LogState = {
	logs: [],
	filter: initialFilter,
	connectionStatus: 'disconnected',
	isPanelOpen: false,
	autoScroll: true,
	maxLogs: 500,
	reconnectAttempts: 0,
	lastError: null,
}

// Maximum reconnection attempts before giving up
const MAX_RECONNECT_ATTEMPTS = 10
// Base delay for exponential backoff (ms)
const BASE_RECONNECT_DELAY = 1000

/**
 * Reducer for log state management
 */
function logReducer(state: LogState, action: LogAction): LogState {
	switch (action.type) {
		case 'ADD_LOG': {
			const newLogs = [...state.logs, action.payload]
			// Keep memory bounded - use slice for O(1) instead of shift O(n)
			return {
				...state,
				logs: newLogs.length > state.maxLogs ? newLogs.slice(-state.maxLogs) : newLogs,
			}
		}
		case 'ADD_LOGS': {
			const newLogs = [...state.logs, ...action.payload]
			// Keep memory bounded - use slice for efficiency
			return {
				...state,
				logs: newLogs.length > state.maxLogs ? newLogs.slice(-state.maxLogs) : newLogs,
			}
		}
		case 'CLEAR_LOGS':
			return { ...state, logs: [], lastError: null }
		case 'SET_FILTER':
			return { ...state, filter: { ...state.filter, ...action.payload } }
		case 'SET_CONNECTION_STATUS':
			return {
				...state,
				connectionStatus: action.payload,
				// Clear error on successful connection
				lastError: action.payload === 'connected' ? null : state.lastError,
			}
		case 'SET_ERROR':
			return { ...state, lastError: action.payload, connectionStatus: 'error' }
		case 'INCREMENT_RECONNECT':
			return { ...state, reconnectAttempts: state.reconnectAttempts + 1 }
		case 'RESET_RECONNECT':
			return { ...state, reconnectAttempts: 0, lastError: null }
		case 'TOGGLE_PANEL':
			return { ...state, isPanelOpen: !state.isPanelOpen }
		case 'SET_PANEL_OPEN':
			return { ...state, isPanelOpen: action.payload }
		case 'TOGGLE_AUTO_SCROLL':
			return { ...state, autoScroll: !state.autoScroll }
		default:
			return state
	}
}

/**
 * Context value interface
 */
interface LogContextValue {
	state: LogState
	filteredLogs: DemoLogEntry[]
	addLog: (log: DemoLogEntry) => void
	clearLogs: () => void
	setFilter: (filter: Partial<LogFilter>) => void
	toggleLevel: (level: LogLevel) => void
	toggleRuntime: (runtime: Runtime | 'unknown') => void
	setSearch: (search: string) => void
	togglePanel: () => void
	setPanelOpen: (open: boolean) => void
	toggleAutoScroll: () => void
	clearServerLogs: () => Promise<void>
}

const LogContext = createContext<LogContextValue | null>(null)

/**
 * Log provider component
 * Wraps the app and provides log state + SSE connection
 */
export function LogProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(logReducer, initialState)

	// Memoized filter function
	const filteredLogs = state.logs.filter((log) => {
		// Level filter
		if (!state.filter.levels.has(log.level)) return false
		// Runtime filter
		if (!state.filter.runtimes.has(log.runtime)) return false
		// Namespace filter
		if (
			state.filter.namespace &&
			log.namespace &&
			!log.namespace.includes(state.filter.namespace)
		) {
			return false
		}
		// Search filter
		if (state.filter.search) {
			const searchLower = state.filter.search.toLowerCase()
			const messageMatch = log.message.toLowerCase().includes(searchLower)
			const metadataMatch =
				log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchLower)
			if (!messageMatch && !metadataMatch) return false
		}
		return true
	})

	// Connect to SSE stream with exponential backoff reconnection
	useEffect(() => {
		let eventSource: EventSource | null = null
		let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
		let isMounted = true

		const connect = () => {
			if (!isMounted) return

			dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' })
			eventSource = new EventSource('/api/logs')

			eventSource.onopen = () => {
				if (!isMounted) return
				dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
				dispatch({ type: 'RESET_RECONNECT' })
			}

			eventSource.onmessage = (event) => {
				if (!isMounted) return
				try {
					const log = JSON.parse(event.data) as DemoLogEntry
					dispatch({ type: 'ADD_LOG', payload: log })
				} catch (error) {
					console.error(
						'[LogProvider] Failed to parse log entry:',
						error instanceof Error ? error.message : 'Unknown error',
					)
				}
			}

			eventSource.onerror = (error) => {
				if (!isMounted) return

				// Close current connection
				eventSource?.close()
				eventSource = null

				dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
				dispatch({ type: 'INCREMENT_RECONNECT' })

				// Check if we should retry
				if (state.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
					// Calculate delay with exponential backoff (max 30s)
					const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** state.reconnectAttempts, 30000)
					console.warn(
						`[LogProvider] Connection lost. Reconnecting in ${delay}ms (attempt ${state.reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`,
					)
					reconnectTimeout = setTimeout(connect, delay)
				} else {
					dispatch({
						type: 'SET_ERROR',
						payload: 'Maximum reconnection attempts reached. Please refresh the page.',
					})
					console.error('[LogProvider] Max reconnection attempts reached')
				}
			}
		}

		connect()

		return () => {
			isMounted = false
			if (reconnectTimeout) {
				clearTimeout(reconnectTimeout)
			}
			if (eventSource) {
				eventSource.close()
			}
			dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
		}
	}, [state.reconnectAttempts])

	// Action creators
	const addLog = useCallback((log: DemoLogEntry) => {
		dispatch({ type: 'ADD_LOG', payload: log })
	}, [])

	const clearLogs = useCallback(() => {
		dispatch({ type: 'CLEAR_LOGS' })
	}, [])

	const setFilter = useCallback((filter: Partial<LogFilter>) => {
		dispatch({ type: 'SET_FILTER', payload: filter })
	}, [])

	const toggleLevel = useCallback(
		(level: LogLevel) => {
			const newLevels = new Set(state.filter.levels)
			if (newLevels.has(level)) {
				newLevels.delete(level)
			} else {
				newLevels.add(level)
			}
			dispatch({ type: 'SET_FILTER', payload: { levels: newLevels } })
		},
		[state.filter.levels],
	)

	const toggleRuntime = useCallback(
		(runtime: Runtime | 'unknown') => {
			const newRuntimes = new Set(state.filter.runtimes)
			if (newRuntimes.has(runtime)) {
				newRuntimes.delete(runtime)
			} else {
				newRuntimes.add(runtime)
			}
			dispatch({ type: 'SET_FILTER', payload: { runtimes: newRuntimes } })
		},
		[state.filter.runtimes],
	)

	const setSearch = useCallback((search: string) => {
		dispatch({ type: 'SET_FILTER', payload: { search } })
	}, [])

	const togglePanel = useCallback(() => {
		dispatch({ type: 'TOGGLE_PANEL' })
	}, [])

	const setPanelOpen = useCallback((open: boolean) => {
		dispatch({ type: 'SET_PANEL_OPEN', payload: open })
	}, [])

	const toggleAutoScroll = useCallback(() => {
		dispatch({ type: 'TOGGLE_AUTO_SCROLL' })
	}, [])

	const clearServerLogs = useCallback(async () => {
		try {
			const response = await fetch('/api/logs', { method: 'DELETE' })
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.error || `HTTP ${response.status}`)
			}
			dispatch({ type: 'CLEAR_LOGS' })
		} catch (error) {
			console.error(
				'[LogProvider] Failed to clear server logs:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Still clear local logs even if server clear fails
			dispatch({ type: 'CLEAR_LOGS' })
			throw error // Re-throw so caller can handle
		}
	}, [])

	const value: LogContextValue = {
		state,
		filteredLogs,
		addLog,
		clearLogs,
		setFilter,
		toggleLevel,
		toggleRuntime,
		setSearch,
		togglePanel,
		setPanelOpen,
		toggleAutoScroll,
		clearServerLogs,
	}

	return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}

/**
 * Hook to access log context
 */
export function useLogContext() {
	const context = useContext(LogContext)
	if (!context) {
		throw new Error('useLogContext must be used within a LogProvider')
	}
	return context
}

/**
 * Hook for just the filtered logs (common use case)
 */
export function useLogs() {
	const { filteredLogs } = useLogContext()
	return filteredLogs
}

/**
 * Hook for log panel state
 */
export function useLogPanel() {
	const { state, togglePanel, setPanelOpen, filteredLogs } = useLogContext()
	return {
		isOpen: state.isPanelOpen,
		toggle: togglePanel,
		setOpen: setPanelOpen,
		logCount: filteredLogs.length,
		isConnected: state.connectionStatus === 'connected',
		connectionStatus: state.connectionStatus,
		lastError: state.lastError,
		reconnectAttempts: state.reconnectAttempts,
	}
}
