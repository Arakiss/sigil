'use client'

/**
 * @vestig/next/dev - Development tools for vestig logging
 *
 * This module provides real-time log viewing and debugging tools
 * for development environments.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { VestigDevOverlay } from '@vestig/next/dev'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         {process.env.NODE_ENV === 'development' && <VestigDevOverlay />}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * @packageDocumentation
 */

// Main overlay component
export { VestigDevOverlay, type VestigDevOverlayProps } from './overlay'

// Store for programmatic access
export { logStore, type DevLogEntry, type LogFilters, type LogStore } from './store'

// Hooks for custom integrations
export {
	useLogStore,
	useServerLogs,
	useClientLogCapture,
	useDevOverlayShortcuts,
} from './hooks/use-logs'

// Individual components for custom layouts
export { LogEntry } from './log-entry'
export { LogViewer } from './log-viewer'
export { Filters } from './filters'

// Metrics components for Dev Overlay
export { MetricsPanel } from './metrics-panel'
export { MetricsCard } from './metrics-card'
export { MetricsHistogram } from './metrics-histogram'
