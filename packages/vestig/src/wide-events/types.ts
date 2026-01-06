import type { LogContext, LogLevel, LogMetadata, Runtime, SerializedError } from '../types'

/**
 * Status of a wide event after completion
 */
export type WideEventStatus = 'success' | 'error' | 'timeout' | 'cancelled'

/**
 * A comprehensive event representing a complete unit of work.
 *
 * Wide events (also called Canonical Log Lines) capture all context
 * about a request/operation in a single structured event, making
 * debugging and observability significantly easier.
 */
export interface WideEvent {
	/** ISO 8601 timestamp when the event started */
	started_at: string
	/** ISO 8601 timestamp when the event ended */
	ended_at: string
	/** Duration in milliseconds */
	duration_ms: number

	/** Event type identifier (e.g., 'http.request', 'job.execute') */
	event_type: string
	/** Event status after completion */
	status: WideEventStatus

	/** Correlation context from parent logger/span */
	context: WideEventContext

	/** Runtime environment where the event occurred */
	runtime: Runtime

	/** All accumulated fields organized by category */
	fields: WideEventFields

	/** Error information if status is 'error' */
	error?: SerializedError

	/** Log level used when emitting (default: 'info', 'error' if failed) */
	level: LogLevel
}

/**
 * Context for correlation and tracing
 */
export interface WideEventContext extends LogContext {
	/** Request/operation identifier */
	requestId?: string
	/** Distributed trace identifier */
	traceId?: string
	/** Current span identifier */
	spanId?: string
	/** Parent span identifier */
	parentSpanId?: string
	/** User identifier */
	userId?: string
	/** Session identifier */
	sessionId?: string
}

/**
 * Accumulated fields organized by category.
 *
 * Categories allow structured organization while keeping
 * the event queryable. Common categories:
 * - http: HTTP request/response details
 * - user: User context (id, subscription, etc.)
 * - error: Error details beyond SerializedError
 * - performance: Timing and metrics
 * - custom: Application-specific fields
 */
export type WideEventFields = Record<string, Record<string, unknown>>

/**
 * Configuration for creating a wide event
 */
export interface WideEventConfig {
	/** Event type identifier (e.g., 'http.request') */
	type: string
	/** Initial context (requestId, traceId, etc.) */
	context?: Partial<WideEventContext>
	/** Initial fields to set */
	fields?: WideEventFields
}

/**
 * Options for ending a wide event
 */
export interface WideEventEndOptions {
	/** Override the status (default: inferred from error presence) */
	status?: WideEventStatus
	/** Error to attach */
	error?: Error | SerializedError
	/** Additional fields to merge before emission */
	fields?: WideEventFields
	/** Override log level (default: 'info', or 'error' if failed) */
	level?: LogLevel
}

/**
 * Builder interface for accumulating wide event context.
 *
 * The builder pattern allows enriching the event throughout
 * the request lifecycle, then emitting once at the end.
 *
 * @example
 * ```typescript
 * const event = createWideEvent({ type: 'http.request' });
 *
 * // Enrich with HTTP context
 * event.set('http', 'method', 'POST');
 * event.set('http', 'path', '/api/checkout');
 *
 * // Enrich with user context
 * event.set('user', 'id', userId);
 * event.set('user', 'subscription', 'premium');
 *
 * // End and emit
 * event.end({ status: 'success' });
 * ```
 */
export interface WideEventBuilder {
	/** Event type identifier */
	readonly type: string

	/** Start time in milliseconds (performance.now or Date.now) */
	readonly startTime: number

	/** Whether the event has been ended/emitted */
	readonly ended: boolean

	/**
	 * Set a single field value within a category.
	 *
	 * @param category - Field category (e.g., 'http', 'user', 'performance')
	 * @param key - Field key within the category
	 * @param value - Field value
	 * @returns this for chaining
	 */
	set(category: string, key: string, value: unknown): this

	/**
	 * Get a field value from a category.
	 *
	 * @param category - Field category
	 * @param key - Field key within the category
	 * @returns The field value or undefined
	 */
	get(category: string, key: string): unknown

	/**
	 * Merge multiple fields into a category.
	 *
	 * @param category - Field category
	 * @param fields - Fields to merge
	 * @returns this for chaining
	 */
	merge(category: string, fields: Record<string, unknown>): this

	/**
	 * Merge entire categories at once.
	 *
	 * @param fields - Categories with their fields
	 * @returns this for chaining
	 */
	mergeAll(fields: WideEventFields): this

	/**
	 * Set the event context (requestId, traceId, etc.).
	 *
	 * @param context - Context to merge with existing
	 * @returns this for chaining
	 */
	setContext(context: Partial<WideEventContext>): this

	/**
	 * Get the current context.
	 */
	getContext(): WideEventContext

	/**
	 * Get all accumulated fields.
	 */
	getFields(): Readonly<WideEventFields>

	/**
	 * End the event and prepare it for emission.
	 *
	 * After calling end(), the builder is frozen and no
	 * further modifications are allowed.
	 *
	 * @param options - End options (status, error, final fields)
	 * @returns The completed WideEvent
	 */
	end(options?: WideEventEndOptions): WideEvent

	/**
	 * Convert to a flattened metadata object for traditional logging.
	 *
	 * Useful for emitting through existing logger.info() calls.
	 * Keys are flattened as 'category.key' format.
	 */
	toMetadata(): LogMetadata
}

/**
 * Configuration for tail-based sampling of wide events.
 *
 * Tail sampling makes the decision AFTER the event completes,
 * allowing 100% retention of errors while sampling success.
 */
export interface TailSamplingConfig {
	/** Enable tail sampling (default: true) */
	enabled?: boolean

	/**
	 * Always keep events with these statuses (default: ['error'])
	 */
	alwaysKeepStatuses?: WideEventStatus[]

	/**
	 * Always keep events above this duration in ms (default: undefined - disabled)
	 */
	slowThresholdMs?: number

	/**
	 * Sampling rate for successful events (0-1, default: 1.0 - keep all)
	 */
	successSampleRate?: number

	/**
	 * VIP user IDs that always get 100% sampling
	 */
	vipUserIds?: string[]

	/**
	 * VIP user subscription tiers that always get 100% sampling
	 */
	vipTiers?: string[]

	/**
	 * Field path to check for tier (default: 'user.subscription')
	 */
	tierFieldPath?: string
}
