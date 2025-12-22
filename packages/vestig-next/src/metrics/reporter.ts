/**
 * Metrics Reporter
 *
 * Handles batched reporting of metrics to the server.
 * Uses sendBeacon for reliable delivery on page unload.
 *
 * @packageDocumentation
 */

import type { MetricEntry, MetricsReportPayload } from './types'

/**
 * Reporter configuration
 */
interface ReporterConfig {
	/** Endpoint to report metrics to */
	endpoint: string
	/** Batch interval in milliseconds */
	batchInterval: number
	/** Maximum batch size before forced flush */
	maxBatchSize: number
	/** Enable debug logging */
	debug: boolean
}

/**
 * Metrics Reporter class
 *
 * Collects metrics and sends them in batches to minimize network overhead.
 * Uses sendBeacon on page unload to ensure metrics are not lost.
 *
 * @example
 * ```ts
 * const reporter = new MetricsReporter({
 *   endpoint: '/api/vestig/metrics',
 *   batchInterval: 5000,
 *   maxBatchSize: 50,
 *   debug: false
 * })
 *
 * reporter.report(metric)
 * reporter.reportImmediate(criticalMetric) // Bypass batch
 * ```
 */
export class MetricsReporter {
	private config: ReporterConfig
	private queue: MetricEntry[] = []
	private flushTimer: ReturnType<typeof setInterval> | null = null
	private isDestroyed = false

	constructor(config: Partial<ReporterConfig> = {}) {
		this.config = {
			endpoint: config.endpoint ?? '/api/vestig/metrics',
			batchInterval: config.batchInterval ?? 5000,
			maxBatchSize: config.maxBatchSize ?? 50,
			debug: config.debug ?? false,
		}

		this.startBatchTimer()
		this.setupUnloadHandler()
	}

	/**
	 * Add a metric to the batch queue
	 */
	report(metric: MetricEntry): void {
		if (this.isDestroyed) return

		this.queue.push(metric)

		if (this.config.debug) {
			console.log('[vestig-metrics] Queued:', metric.name, metric.value)
		}

		// Force flush if queue is full
		if (this.queue.length >= this.config.maxBatchSize) {
			this.flush()
		}
	}

	/**
	 * Report a metric immediately (bypasses batch)
	 * Use for critical metrics like "poor" ratings
	 */
	reportImmediate(metric: MetricEntry): void {
		if (this.isDestroyed) return

		if (this.config.debug) {
			console.log('[vestig-metrics] Immediate report:', metric.name, metric.value)
		}

		this.sendMetrics([metric])
	}

	/**
	 * Flush all queued metrics
	 */
	flush(): void {
		if (this.queue.length === 0) return

		const metrics = [...this.queue]
		this.queue = []

		if (this.config.debug) {
			console.log('[vestig-metrics] Flushing', metrics.length, 'metrics')
		}

		this.sendMetrics(metrics)
	}

	/**
	 * Destroy the reporter and clean up
	 */
	destroy(): void {
		this.isDestroyed = true

		if (this.flushTimer) {
			clearInterval(this.flushTimer)
			this.flushTimer = null
		}

		// Final flush
		this.flush()
	}

	/**
	 * Start the batch timer
	 */
	private startBatchTimer(): void {
		this.flushTimer = setInterval(() => {
			this.flush()
		}, this.config.batchInterval)
	}

	/**
	 * Set up page unload handler to flush metrics
	 */
	private setupUnloadHandler(): void {
		if (typeof document === 'undefined') return

		const handleVisibilityChange = (): void => {
			if (document.visibilityState === 'hidden') {
				this.flushWithBeacon()
			}
		}

		// visibilitychange is more reliable than beforeunload
		document.addEventListener('visibilitychange', handleVisibilityChange)
	}

	/**
	 * Flush metrics using sendBeacon (for page unload)
	 */
	private flushWithBeacon(): void {
		if (this.queue.length === 0) return

		const metrics = [...this.queue]
		this.queue = []

		const payload = this.createPayload(metrics)

		// Use sendBeacon for reliable delivery during page unload
		if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
			const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
			navigator.sendBeacon(this.config.endpoint, blob)

			if (this.config.debug) {
				console.log('[vestig-metrics] Beacon sent:', metrics.length, 'metrics')
			}
		} else {
			// Fallback to fetch
			this.sendMetrics(metrics)
		}
	}

	/**
	 * Send metrics via fetch
	 */
	private async sendMetrics(metrics: MetricEntry[]): Promise<void> {
		if (metrics.length === 0) return

		const payload = this.createPayload(metrics)

		try {
			const response = await fetch(this.config.endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				// Use keepalive for reliability during page transitions
				keepalive: true,
			})

			if (!response.ok && this.config.debug) {
				console.error('[vestig-metrics] Report failed:', response.status)
			}
		} catch (error) {
			if (this.config.debug) {
				console.error('[vestig-metrics] Report error:', error)
			}
		}
	}

	/**
	 * Create the report payload
	 */
	private createPayload(metrics: MetricEntry[]): MetricsReportPayload {
		return {
			metrics,
			client: {
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
				pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
				timestamp: new Date().toISOString(),
			},
		}
	}
}
