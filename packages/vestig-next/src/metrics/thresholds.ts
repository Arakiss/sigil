/**
 * Core Web Vitals Thresholds
 *
 * Official thresholds from Google's Core Web Vitals program.
 * These determine whether a metric is rated as "good", "needs-improvement", or "poor".
 *
 * @see https://web.dev/articles/vitals
 * @packageDocumentation
 */

import type { MetricRating, WebVitalName } from './types'

/**
 * Threshold definition for a metric
 */
interface MetricThreshold {
	/** Upper bound for "good" rating (exclusive) */
	good: number
	/** Upper bound for "needs-improvement" rating (exclusive) */
	poor: number
	/** Unit of measurement */
	unit: 'ms' | 'score'
	/** Human-readable description */
	description: string
}

/**
 * Official Core Web Vitals thresholds
 *
 * Values represent the upper bounds:
 * - good: value < threshold.good
 * - needs-improvement: threshold.good <= value < threshold.poor
 * - poor: value >= threshold.poor
 */
export const THRESHOLDS: Record<WebVitalName, MetricThreshold> = {
	/**
	 * Largest Contentful Paint
	 * Measures loading performance - when the largest content element becomes visible
	 */
	LCP: {
		good: 2500,
		poor: 4000,
		unit: 'ms',
		description: 'Largest Contentful Paint - Loading performance',
	},

	/**
	 * Cumulative Layout Shift
	 * Measures visual stability - how much the page layout shifts unexpectedly
	 */
	CLS: {
		good: 0.1,
		poor: 0.25,
		unit: 'score',
		description: 'Cumulative Layout Shift - Visual stability',
	},

	/**
	 * Interaction to Next Paint
	 * Measures interactivity - time from user interaction to visual feedback
	 */
	INP: {
		good: 200,
		poor: 500,
		unit: 'ms',
		description: 'Interaction to Next Paint - Interactivity',
	},

	/**
	 * Time to First Byte
	 * Measures server responsiveness - time until first byte of response
	 */
	TTFB: {
		good: 800,
		poor: 1800,
		unit: 'ms',
		description: 'Time to First Byte - Server responsiveness',
	},

	/**
	 * First Contentful Paint
	 * Measures perceived load speed - when first content is rendered
	 */
	FCP: {
		good: 1800,
		poor: 3000,
		unit: 'ms',
		description: 'First Contentful Paint - Perceived load speed',
	},
}

/**
 * Calculate rating for a metric value
 *
 * @param name - Web Vital metric name
 * @param value - Metric value
 * @returns Rating based on thresholds
 *
 * @example
 * ```ts
 * getRating('LCP', 2000) // 'good'
 * getRating('LCP', 3000) // 'needs-improvement'
 * getRating('LCP', 5000) // 'poor'
 * ```
 */
export function getRating(name: WebVitalName, value: number): MetricRating {
	const threshold = THRESHOLDS[name]
	if (!threshold) return 'needs-improvement'

	if (value < threshold.good) return 'good'
	if (value < threshold.poor) return 'needs-improvement'
	return 'poor'
}

/**
 * Get human-readable description for a metric
 */
export function getMetricDescription(name: WebVitalName): string {
	return THRESHOLDS[name]?.description ?? name
}

/**
 * Get unit for a metric
 */
export function getMetricUnit(name: WebVitalName): 'ms' | 'score' {
	return THRESHOLDS[name]?.unit ?? 'ms'
}

/**
 * Format a metric value for display
 *
 * @param name - Metric name
 * @param value - Metric value
 * @returns Formatted string
 *
 * @example
 * ```ts
 * formatMetricValue('LCP', 2500) // '2.50s'
 * formatMetricValue('CLS', 0.15) // '0.15'
 * formatMetricValue('INP', 150)  // '150ms'
 * ```
 */
export function formatMetricValue(name: WebVitalName, value: number): string {
	const unit = getMetricUnit(name)

	if (unit === 'score') {
		return value.toFixed(3)
	}

	// For timing metrics
	if (value < 1) {
		return `${(value * 1000).toFixed(0)}μs`
	}
	if (value < 1000) {
		return `${value.toFixed(0)}ms`
	}
	return `${(value / 1000).toFixed(2)}s`
}

/**
 * Rating colors for UI display
 */
export const RATING_COLORS: Record<MetricRating, { bg: string; text: string; border: string }> = {
	good: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
	'needs-improvement': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
	poor: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
}

/**
 * Get color scheme for a rating
 */
export function getRatingColors(rating: MetricRating): (typeof RATING_COLORS)[MetricRating] {
	return RATING_COLORS[rating]
}
