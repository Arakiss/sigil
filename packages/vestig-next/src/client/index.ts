'use client'

// Client-side exports for @vestig/next/client

// Provider
export { VestigProvider, useVestigContext, type VestigProviderProps } from './provider'

// Hooks
export {
	useLogger,
	useCorrelationContext,
	useVestigConnection,
	useComponentLogger,
	useRenderLogger,
} from './hooks'

// Error Boundary
export {
	VestigErrorBoundary,
	addBreadcrumb,
	getBreadcrumbs,
	clearBreadcrumbs,
	type VestigErrorBoundaryProps,
	type Breadcrumb,
} from './error-boundary'

// Transport (for advanced use cases)
export {
	ClientHTTPTransport,
	createClientTransport,
	type ClientHTTPTransportConfig,
	type OfflineQueueConfig,
} from './transport'
