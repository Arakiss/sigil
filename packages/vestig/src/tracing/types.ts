/**
 * Tracing types for vestig
 *
 * These types are designed to be compatible with W3C Trace Context
 * and can be easily mapped to OpenTelemetry spans in the future.
 */

/**
 * Span status indicating the outcome of the operation
 */
export type SpanStatus = 'unset' | 'ok' | 'error'

/**
 * An event that occurred during a span's lifetime
 */
export interface SpanEvent {
	/** Event name */
	name: string
	/** ISO timestamp when the event occurred */
	timestamp: string
	/** Optional attributes for the event */
	attributes?: Record<string, unknown>
}

/**
 * A span represents a single operation within a trace
 *
 * Spans can be nested to form a tree structure representing
 * the call hierarchy of your application.
 */
export interface Span {
	// === Identity (readonly) ===

	/** Unique identifier for this span (16 hex chars) */
	readonly spanId: string
	/** Trace identifier shared by all spans in a trace (32 hex chars) */
	readonly traceId: string
	/** Parent span ID if this is a child span */
	readonly parentSpanId?: string
	/** Human-readable name describing this operation */
	readonly name: string
	/** Start time in milliseconds (from performance.now()) */
	readonly startTime: number

	// === Mutable State ===

	/** Current status of the span */
	status: SpanStatus
	/** Optional message describing the status (especially for errors) */
	statusMessage?: string
	/** End time in milliseconds (set when span.end() is called) */
	endTime?: number
	/** Duration in milliseconds (endTime - startTime) */
	duration?: number

	// === API Methods ===

	/**
	 * Set a single attribute on the span
	 * @param key - Attribute name
	 * @param value - Attribute value
	 */
	setAttribute(key: string, value: unknown): void

	/**
	 * Set multiple attributes at once
	 * @param attrs - Object with attribute key-value pairs
	 */
	setAttributes(attrs: Record<string, unknown>): void

	/**
	 * Add an event to the span
	 * Events are timestamped markers that occur during the span's lifetime
	 * @param name - Event name
	 * @param attributes - Optional event attributes
	 */
	addEvent(name: string, attributes?: Record<string, unknown>): void

	/**
	 * Set the span's status
	 * @param status - 'ok' for success, 'error' for failure
	 * @param message - Optional message describing the status
	 */
	setStatus(status: SpanStatus, message?: string): void

	/**
	 * End the span, recording its duration
	 * After calling end(), the span should not be modified
	 */
	end(): void

	// === Readonly Collections ===

	/** All attributes set on this span */
	readonly attributes: Record<string, unknown>
	/** All events recorded on this span */
	readonly events: readonly SpanEvent[]

	// === State Checks ===

	/** Whether the span has ended */
	readonly ended: boolean
}

/**
 * Options for creating a new span
 */
export interface SpanOptions {
	/** Initial attributes to set on the span */
	attributes?: Record<string, unknown>
	/** Explicit parent span (if not using the current active span) */
	parentSpan?: Span
}

/**
 * Function signature for async span callback
 */
export type SpanCallback<T> = (span: Span) => T | Promise<T>

/**
 * Function signature for sync span callback
 */
export type SpanSyncCallback<T> = (span: Span) => T
