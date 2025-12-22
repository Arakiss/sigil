/**
 * Core Web Vitals and Route Metrics Types
 *
 * These types define the structure for capturing and reporting
 * performance metrics in Next.js applications.
 *
 * @packageDocumentation
 */

/**
 * Web Vital metric names
 * - LCP: Largest Contentful Paint (loading performance)
 * - CLS: Cumulative Layout Shift (visual stability)
 * - INP: Interaction to Next Paint (interactivity)
 * - TTFB: Time to First Byte (server responsiveness)
 * - FCP: First Contentful Paint (perceived load speed)
 */
export type WebVitalName = 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP'

/**
 * Rating for a metric based on Core Web Vitals thresholds
 */
export type MetricRating = 'good' | 'needs-improvement' | 'poor'

/**
 * Navigation type from Performance API
 */
export type NavigationType =
	| 'navigate'
	| 'reload'
	| 'back-forward'
	| 'back-forward-cache'
	| 'prerender'
	| 'restore'

/**
 * Web Vital metric captured from the browser
 */
export interface WebVitalMetric {
	/** Metric name (LCP, CLS, INP, TTFB, FCP) */
	name: WebVitalName
	/** Metric value (ms for timing metrics, score for CLS) */
	value: number
	/** Rating based on Core Web Vitals thresholds */
	rating: MetricRating
	/** Change since last measurement */
	delta: number
	/** Unique identifier for this metric instance */
	id: string
	/** How the page was navigated to */
	navigationType: NavigationType
	/** Entries that contributed to this metric */
	entries: PerformanceEntry[]
}

/**
 * Route-specific performance metric
 */
export interface RouteMetric {
	/** Route pathname (e.g., /dashboard, /users/[id]) */
	pathname: string
	/** Time to render the route in ms */
	renderTime: number
	/** Time to hydrate the route in ms */
	hydrationTime: number
	/** Time to fetch route data (if applicable) */
	dataFetchTime?: number
	/** ISO timestamp when metric was captured */
	timestamp: string
	/** Request ID for correlation with server logs */
	requestId?: string
}

/**
 * Stored metric entry for Dev Overlay and reporting
 */
export interface MetricEntry {
	/** Unique identifier */
	id: string
	/** ISO timestamp */
	timestamp: string
	/** Type of metric */
	type: 'web-vital' | 'route' | 'custom'
	/** Metric name */
	name: string
	/** Metric value */
	value: number
	/** Rating (for web vitals) */
	rating?: MetricRating
	/** Additional metadata */
	metadata: {
		pathname?: string
		requestId?: string
		traceId?: string
		userAgent?: string
		navigationType?: NavigationType
		delta?: number
	}
}

/**
 * Histogram bucket for metric visualization
 */
export interface HistogramBucket {
	/** Lower bound of bucket (inclusive) */
	min: number
	/** Upper bound of bucket (exclusive) */
	max: number
	/** Count of values in this bucket */
	count: number
	/** Percentage of total */
	percentage: number
}

/**
 * Summary statistics for a metric
 */
export interface MetricSummary {
	/** Metric name */
	name: string
	/** Number of samples */
	count: number
	/** Average value */
	avg: number
	/** Minimum value */
	min: number
	/** Maximum value */
	max: number
	/** 50th percentile (median) */
	p50: number
	/** 75th percentile */
	p75: number
	/** 95th percentile */
	p95: number
	/** 99th percentile */
	p99: number
	/** Overall rating based on p75 */
	rating: MetricRating
}

/**
 * Configuration for VestigMetrics component
 */
export interface VestigMetricsConfig {
	/**
	 * Sampling rate for metrics collection (0.0 - 1.0)
	 * @default 1.0 in development, 0.1 in production
	 */
	sampleRate?: number
	/**
	 * Endpoint to report metrics to
	 * @default '/api/vestig/metrics'
	 */
	reportEndpoint?: string
	/**
	 * Enable/disable metrics collection
	 * @default true
	 */
	enabled?: boolean
	/**
	 * Batch interval for reporting in milliseconds
	 * @default 5000
	 */
	batchInterval?: number
	/**
	 * Report immediately when a metric has poor rating
	 * @default true
	 */
	reportPoorImmediately?: boolean
	/**
	 * Capture route metrics (render time, hydration)
	 * @default true
	 */
	captureRouteMetrics?: boolean
	/**
	 * Debug mode - logs metrics to console
	 * @default false
	 */
	debug?: boolean
}

/**
 * Metrics store state
 */
export interface MetricsState {
	/** All captured metrics */
	metrics: MetricEntry[]
	/** Maximum number of metrics to keep in memory */
	maxMetrics: number
	/** Latest value for each web vital */
	latestVitals: Partial<Record<WebVitalName, MetricEntry>>
}

/**
 * Metrics store interface
 */
export interface MetricsStore {
	/** Subscribe to store changes */
	subscribe: (listener: () => void) => () => void
	/** Get current snapshot of state */
	getSnapshot: () => MetricsState
	/** Add a new metric */
	addMetric: (entry: Omit<MetricEntry, 'id' | 'timestamp'>) => void
	/** Get histogram for a specific metric */
	getHistogram: (name: string, bucketCount?: number) => HistogramBucket[]
	/** Get summary statistics for a metric */
	getSummary: (name: string) => MetricSummary | null
	/** Get all summaries for web vitals */
	getVitalsSummary: () => Partial<Record<WebVitalName, MetricSummary>>
	/** Get the latest metric for a given name */
	getLatest: (name: string) => MetricEntry | null
	/** Clear all metrics */
	clear: () => void
}

/**
 * Payload for metrics reporting
 */
export interface MetricsReportPayload {
	/** Metrics to report */
	metrics: MetricEntry[]
	/** Client metadata */
	client: {
		userAgent: string
		pathname: string
		timestamp: string
	}
}
