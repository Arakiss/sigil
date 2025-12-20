/**
 * Request timing utilities for measuring performance
 */

/**
 * Timing context for request duration tracking
 */
export interface RequestTiming {
	/** Start time in milliseconds */
	start: number
	/** End time in milliseconds (set when completed) */
	end?: number
	/** Get elapsed time in milliseconds */
	elapsed: () => number
	/** Mark a named checkpoint */
	mark: (name: string) => void
	/** Get a specific mark's elapsed time from start */
	getMark: (name: string) => number | undefined
	/** Get all marks */
	getMarks: () => Record<string, number>
	/** Complete timing (sets end time) */
	complete: () => number
}

/**
 * Create a new request timing context
 */
export function createRequestTiming(): RequestTiming {
	const start = performance.now()
	const marks: Record<string, number> = {}
	let end: number | undefined

	return {
		start,
		get end() {
			return end
		},
		elapsed() {
			return (end ?? performance.now()) - start
		},
		mark(name: string) {
			marks[name] = performance.now() - start
		},
		getMark(name: string) {
			return marks[name]
		},
		getMarks() {
			return { ...marks }
		},
		complete() {
			end = performance.now()
			return end - start
		},
	}
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
	if (ms < 1) {
		return `${(ms * 1000).toFixed(0)}μs`
	}
	if (ms < 1000) {
		return `${ms.toFixed(2)}ms`
	}
	return `${(ms / 1000).toFixed(2)}s`
}
