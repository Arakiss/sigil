/**
 * @vestig/next/metrics - Performance Metrics Module
 *
 * This module provides Core Web Vitals and route-level performance
 * monitoring for Next.js applications.
 *
 * @example Quick Start
 * ```tsx
 * // app/layout.tsx
 * import { VestigMetrics } from '@vestig/next/metrics'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <VestigMetrics />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * @example With Dev Overlay
 * ```tsx
 * import { VestigDevOverlay } from '@vestig/next/dev'
 * import { VestigMetrics } from '@vestig/next/metrics'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         {process.env.NODE_ENV === 'development' && <VestigDevOverlay />}
 *         <VestigMetrics />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * @packageDocumentation
 */

'use client'

// Main component
export { VestigMetrics, type VestigMetricsProps } from './web-vitals'

// Store for programmatic access
export { metricsStore } from './store'

// Hooks
export {
	useWebVitals,
	useWebVitalsData,
	useWebVitalsSummary,
} from './hooks/use-web-vitals'

export {
	useRouteMetrics,
	useRouteMetricsData,
	useRenderTiming,
	useDataFetchTiming,
} from './hooks/use-route-metrics'

// Thresholds and utilities
export {
	THRESHOLDS,
	RATING_COLORS,
	getRating,
	getRatingColors,
	getMetricDescription,
	getMetricUnit,
	formatMetricValue,
} from './thresholds'

// Reporter for custom integrations
export { MetricsReporter } from './reporter'

// Types
export type {
	WebVitalName,
	MetricRating,
	NavigationType,
	WebVitalMetric,
	RouteMetric,
	MetricEntry,
	MetricSummary,
	HistogramBucket,
	MetricsState,
	MetricsStore,
	VestigMetricsConfig,
	MetricsReportPayload,
} from './types'
