/**
 * Web Vitals Hook
 *
 * React hook for capturing Core Web Vitals metrics.
 * Integrates with the web-vitals library and the metrics store.
 *
 * @packageDocumentation
 */

'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import type { Metric } from 'web-vitals'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import { metricsStore } from '../store'
import type { MetricEntry, NavigationType, WebVitalName } from '../types'
import { MetricsReporter } from '../reporter'

/**
 * Options for useWebVitals hook
 */
interface UseWebVitalsOptions {
	/** Enable Web Vitals collection */
	enabled?: boolean
	/** Sampling rate (0.0 - 1.0) */
	sampleRate?: number
	/** Report endpoint */
	reportEndpoint?: string
	/** Report immediately when rating is poor */
	reportPoorImmediately?: boolean
	/** Debug mode */
	debug?: boolean
}

/**
 * Convert web-vitals Metric to our MetricEntry format
 */
function toMetricEntry(metric: Metric): Omit<MetricEntry, 'id' | 'timestamp'> {
	return {
		type: 'web-vital',
		name: metric.name as WebVitalName,
		value: metric.value,
		rating: metric.rating,
		metadata: {
			navigationType: metric.navigationType as NavigationType,
			delta: metric.delta,
			pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
		},
	}
}

/**
 * Hook to capture Core Web Vitals
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useWebVitals({
 *     enabled: process.env.NODE_ENV === 'development',
 *     sampleRate: 0.1,
 *     reportPoorImmediately: true,
 *   })
 *
 *   return <div>My App</div>
 * }
 * ```
 */
export function useWebVitals(options: UseWebVitalsOptions = {}): void {
	const {
		enabled = true,
		sampleRate = 1.0,
		reportEndpoint = '/api/vestig/metrics',
		reportPoorImmediately = true,
		debug = false,
	} = options

	useEffect(() => {
		// Skip if disabled or failed sample
		if (!enabled) return
		if (Math.random() > sampleRate) return

		// Create reporter for this session
		const reporter = new MetricsReporter({
			endpoint: reportEndpoint,
			debug,
		})

		// Handler for all metrics
		const handleMetric = (metric: Metric): void => {
			const entry = toMetricEntry(metric)

			// Add to store
			metricsStore.addMetric(entry)

			if (debug) {
				console.log(`[vestig-metrics] ${metric.name}:`, {
					value: metric.value,
					rating: metric.rating,
					delta: metric.delta,
				})
			}

			// Create full entry with ID for reporter
			const fullEntry: MetricEntry = {
				...entry,
				id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
				timestamp: new Date().toISOString(),
			}

			// Report immediately if poor, otherwise batch
			if (reportPoorImmediately && metric.rating === 'poor') {
				reporter.reportImmediate(fullEntry)
			} else {
				reporter.report(fullEntry)
			}
		}

		// Subscribe to all Core Web Vitals
		// Note: onFID is deprecated, use onINP instead
		onLCP(handleMetric)
		onCLS(handleMetric)
		onINP(handleMetric)
		onTTFB(handleMetric)
		onFCP(handleMetric)

		return () => {
			reporter.destroy()
		}
	}, [enabled, sampleRate, reportEndpoint, reportPoorImmediately, debug])
}

/**
 * Hook to get the current Web Vitals from the store
 *
 * @returns Latest Web Vitals values
 *
 * @example
 * ```tsx
 * function MetricsDisplay() {
 *   const vitals = useWebVitalsData()
 *
 *   return (
 *     <div>
 *       <p>LCP: {vitals.LCP?.value ?? 'N/A'}</p>
 *       <p>CLS: {vitals.CLS?.value ?? 'N/A'}</p>
 *       <p>INP: {vitals.INP?.value ?? 'N/A'}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebVitalsData(): Partial<Record<WebVitalName, MetricEntry>> {
	const subscribe = useCallback((onStoreChange: () => void) => {
		return metricsStore.subscribe(onStoreChange)
	}, [])

	const getSnapshot = useCallback(() => {
		return metricsStore.getSnapshot().latestVitals
	}, [])

	const getServerSnapshot = useCallback(() => {
		return {} as Partial<Record<WebVitalName, MetricEntry>>
	}, [])

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Hook to get Web Vitals summary statistics
 *
 * @returns Summary statistics for all Web Vitals
 */
export function useWebVitalsSummary(): Partial<
	Record<WebVitalName, import('../types').MetricSummary>
> {
	const subscribe = useCallback((onStoreChange: () => void) => {
		return metricsStore.subscribe(onStoreChange)
	}, [])

	const getSnapshot = useCallback(() => {
		return metricsStore.getVitalsSummary()
	}, [])

	const getServerSnapshot = useCallback((): Partial<
		Record<WebVitalName, import('../types').MetricSummary>
	> => {
		return {}
	}, [])

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
