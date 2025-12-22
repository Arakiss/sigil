/**
 * Metrics Store
 *
 * Global store for capturing and managing performance metrics.
 * Follows the same pub/sub pattern as the log store for consistency.
 *
 * @packageDocumentation
 */

import type {
	HistogramBucket,
	MetricEntry,
	MetricRating,
	MetricSummary,
	MetricsState,
	MetricsStore,
	WebVitalName,
} from './types'
import { getRating, THRESHOLDS } from './thresholds'

/**
 * Create a unique ID for metrics
 */
function createMetricId(): string {
	return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sorted: number[], p: number): number {
	if (sorted.length === 0) return 0
	const index = Math.ceil((p / 100) * sorted.length) - 1
	const clampedIndex = Math.max(0, Math.min(index, sorted.length - 1))
	return sorted[clampedIndex] ?? 0
}

/**
 * Create the metrics store singleton
 */
function createMetricsStore(): MetricsStore {
	const state: MetricsState = {
		metrics: [],
		maxMetrics: 500,
		latestVitals: {},
	}

	const listeners = new Set<() => void>()

	function notify(): void {
		for (const listener of listeners) {
			try {
				listener()
			} catch (error) {
				console.error('[vestig-metrics] Listener error:', error)
			}
		}
	}

	return {
		subscribe(listener: () => void): () => void {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},

		getSnapshot(): MetricsState {
			return state
		},

		addMetric(entry: Omit<MetricEntry, 'id' | 'timestamp'>): void {
			const metric: MetricEntry = {
				...entry,
				id: createMetricId(),
				timestamp: new Date().toISOString(),
			}

			state.metrics.push(metric)

			// Update latest vitals cache
			if (entry.type === 'web-vital') {
				state.latestVitals[entry.name as WebVitalName] = metric
			}

			// Trim if over limit
			if (state.metrics.length > state.maxMetrics) {
				state.metrics = state.metrics.slice(-state.maxMetrics)
			}

			notify()
		},

		getHistogram(name: string, bucketCount = 10): HistogramBucket[] {
			const values = state.metrics.filter((m) => m.name === name).map((m) => m.value)

			if (values.length === 0) return []

			const min = Math.min(...values)
			const max = Math.max(...values)
			const range = max - min || 1
			const bucketSize = range / bucketCount

			const buckets: HistogramBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
				min: min + i * bucketSize,
				max: min + (i + 1) * bucketSize,
				count: 0,
				percentage: 0,
			}))

			for (const value of values) {
				const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1)
				const bucket = buckets[bucketIndex]
				if (bucket) bucket.count++
			}

			// Calculate percentages
			for (const bucket of buckets) {
				bucket.percentage = (bucket.count / values.length) * 100
			}

			return buckets
		},

		getSummary(name: string): MetricSummary | null {
			const values = state.metrics.filter((m) => m.name === name).map((m) => m.value)

			if (values.length === 0) return null

			const sorted = [...values].sort((a, b) => a - b)
			const sum = values.reduce((acc, v) => acc + v, 0)
			const avg = sum / values.length
			const p75 = percentile(sorted, 75)

			// Determine rating based on p75 for web vitals
			let rating: MetricRating = 'needs-improvement'
			if (name in THRESHOLDS) {
				rating = getRating(name as WebVitalName, p75)
			}

			return {
				name,
				count: values.length,
				avg,
				min: sorted[0] ?? 0,
				max: sorted[sorted.length - 1] ?? 0,
				p50: percentile(sorted, 50),
				p75,
				p95: percentile(sorted, 95),
				p99: percentile(sorted, 99),
				rating,
			}
		},

		getVitalsSummary(): Partial<Record<WebVitalName, MetricSummary>> {
			const result: Partial<Record<WebVitalName, MetricSummary>> = {}
			const vitals: WebVitalName[] = ['LCP', 'CLS', 'INP', 'TTFB', 'FCP']

			for (const name of vitals) {
				const summary = this.getSummary(name)
				if (summary) {
					result[name] = summary
				}
			}

			return result
		},

		getLatest(name: string): MetricEntry | null {
			if (name in state.latestVitals) {
				return state.latestVitals[name as WebVitalName] ?? null
			}

			const metrics = state.metrics.filter((m) => m.name === name)
			return metrics[metrics.length - 1] ?? null
		},

		clear(): void {
			state.metrics = []
			state.latestVitals = {}
			notify()
		},
	}
}

/**
 * Global metrics store singleton
 *
 * @example
 * ```ts
 * import { metricsStore } from '@vestig/next/metrics'
 *
 * // Subscribe to changes
 * const unsubscribe = metricsStore.subscribe(() => {
 *   const summary = metricsStore.getVitalsSummary()
 *   console.log('LCP p75:', summary.LCP?.p75)
 * })
 *
 * // Add a metric
 * metricsStore.addMetric({
 *   type: 'web-vital',
 *   name: 'LCP',
 *   value: 2500,
 *   rating: 'needs-improvement',
 *   metadata: { pathname: '/dashboard' }
 * })
 * ```
 */
export const metricsStore = createMetricsStore()
