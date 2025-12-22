'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { logStore, type DevLogEntry, type LogFilters } from '../store'
import type { LogLevel } from 'vestig'

/**
 * Hook to subscribe to log store
 */
export function useLogStore() {
	const logs = useSyncExternalStore(
		logStore.subscribe,
		() => logStore.getFilteredLogs(),
		() => [], // SSR fallback
	)

	const state = useSyncExternalStore(
		logStore.subscribe,
		() => logStore.getSnapshot(),
		() => ({ logs: [], filters: getDefaultFilters(), isOpen: false, maxLogs: 500 }),
	)

	return {
		logs,
		isOpen: state.isOpen,
		filters: state.filters,
		namespaces: logStore.getNamespaces(),
		levelCounts: logStore.getLevelCounts(),
		// Actions
		toggleOpen: logStore.toggleOpen,
		setOpen: logStore.setOpen,
		clearLogs: logStore.clearLogs,
		setLevelFilter: logStore.setLevelFilter,
		toggleAllLevels: logStore.toggleAllLevels,
		setNamespaceFilter: logStore.setNamespaceFilter,
		setSearch: logStore.setSearch,
		setSourceFilter: logStore.setSourceFilter,
	}
}

function getDefaultFilters(): LogFilters {
	return {
		levels: new Set(['trace', 'debug', 'info', 'warn', 'error'] as LogLevel[]),
		namespaces: new Set(),
		search: '',
		source: 'all',
	}
}

/**
 * SSE connection state
 */
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Hook to connect to SSE log stream
 */
export function useServerLogs(options: {
	endpoint?: string
	enabled?: boolean
	reconnectDelay?: number
	maxReconnectAttempts?: number
}) {
	const {
		endpoint = '/api/vestig/logs',
		enabled = true,
		reconnectDelay = 2000,
		maxReconnectAttempts = 5,
	} = options

	const eventSourceRef = useRef<EventSource | null>(null)
	const reconnectAttempts = useRef(0)
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const connectionStateRef = useRef<ConnectionState>('disconnected')

	const connect = useCallback(() => {
		// Only connect in browser
		if (typeof window === 'undefined') return
		if (!enabled) return

		// Clean up existing connection
		if (eventSourceRef.current) {
			eventSourceRef.current.close()
		}

		connectionStateRef.current = 'connecting'

		try {
			const eventSource = new EventSource(endpoint)
			eventSourceRef.current = eventSource

			eventSource.onopen = () => {
				connectionStateRef.current = 'connected'
				reconnectAttempts.current = 0
			}

			eventSource.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data)

					if (data.type === 'log') {
						logStore.addLog({
							timestamp: data.timestamp,
							level: data.level,
							message: data.message,
							namespace: data.namespace,
							metadata: data.metadata,
							context: data.context,
							error: data.error,
							source: 'server',
							traceId: data.context?.traceId,
							spanId: data.context?.spanId,
							duration: data.duration,
						})
					} else if (data.type === 'batch') {
						const entries: Array<Omit<DevLogEntry, 'id'>> = data.logs.map(
							(log: Record<string, unknown>) => ({
								timestamp: log.timestamp as string,
								level: log.level as LogLevel,
								message: log.message as string,
								namespace: log.namespace as string | undefined,
								metadata: log.metadata as Record<string, unknown> | undefined,
								context: log.context as Record<string, unknown> | undefined,
								error: log.error as DevLogEntry['error'] | undefined,
								source: 'server' as const,
								traceId: (log.context as Record<string, unknown> | undefined)?.traceId as
									| string
									| undefined,
								spanId: (log.context as Record<string, unknown> | undefined)?.spanId as
									| string
									| undefined,
								duration: log.duration as number | undefined,
							}),
						)
						logStore.addLogs(entries)
					}
				} catch (error) {
					console.error('[vestig-dev] Failed to parse SSE message:', error)
				}
			}

			eventSource.onerror = () => {
				connectionStateRef.current = 'error'
				eventSource.close()
				eventSourceRef.current = null

				// Attempt reconnection
				if (reconnectAttempts.current < maxReconnectAttempts) {
					reconnectAttempts.current++
					const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current - 1)

					reconnectTimeoutRef.current = setTimeout(() => {
						connect()
					}, delay)
				} else {
					connectionStateRef.current = 'disconnected'
				}
			}
		} catch (error) {
			console.error('[vestig-dev] Failed to create EventSource:', error)
			connectionStateRef.current = 'error'
		}
	}, [endpoint, enabled, reconnectDelay, maxReconnectAttempts])

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}

		if (eventSourceRef.current) {
			eventSourceRef.current.close()
			eventSourceRef.current = null
		}

		connectionStateRef.current = 'disconnected'
		reconnectAttempts.current = 0
	}, [])

	useEffect(() => {
		if (enabled) {
			connect()
		} else {
			disconnect()
		}

		return () => {
			disconnect()
		}
	}, [enabled, connect, disconnect])

	return {
		connect,
		disconnect,
		isConnected: connectionStateRef.current === 'connected',
		connectionState: connectionStateRef.current,
	}
}

/**
 * Hook to capture client-side logs
 */
export function useClientLogCapture(options: { enabled?: boolean } = {}) {
	const { enabled = true } = options

	useEffect(() => {
		if (!enabled) return
		if (typeof window === 'undefined') return

		// Intercept client logs from VestigProvider
		// This works by patching the transport's internal send
		// We listen to a custom event dispatched by the transport

		const handleClientLog = (event: CustomEvent<Omit<DevLogEntry, 'id' | 'source'>>) => {
			logStore.addLog({
				...event.detail,
				source: 'client',
			})
		}

		window.addEventListener('vestig:client-log', handleClientLog as EventListener)

		return () => {
			window.removeEventListener('vestig:client-log', handleClientLog as EventListener)
		}
	}, [enabled])
}

/**
 * Hook for keyboard shortcuts
 */
export function useDevOverlayShortcuts(options: { toggleKey?: string; enabled?: boolean } = {}) {
	const { toggleKey = 'l', enabled = true } = options

	useEffect(() => {
		if (!enabled) return
		if (typeof window === 'undefined') return

		const handleKeyDown = (event: KeyboardEvent) => {
			// Cmd/Ctrl + L to toggle
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === toggleKey) {
				event.preventDefault()
				logStore.toggleOpen()
			}

			// Escape to close
			if (event.key === 'Escape' && logStore.getSnapshot().isOpen) {
				logStore.setOpen(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [toggleKey, enabled])
}
