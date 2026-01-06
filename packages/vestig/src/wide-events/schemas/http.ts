/**
 * HTTP request fields for wide events.
 *
 * These fields capture standard HTTP request/response information
 * that is commonly needed for debugging and observability.
 */
export interface HttpFields {
	/** HTTP method (GET, POST, PUT, DELETE, etc.) */
	method?: string
	/** Request path (e.g., /api/v1/users) */
	path?: string
	/** Full URL if needed */
	url?: string
	/** HTTP status code */
	status_code?: number
	/** Request protocol (http, https) */
	protocol?: string
	/** HTTP version (1.1, 2, 3) */
	http_version?: string
	/** Request body size in bytes */
	request_size_bytes?: number
	/** Response body size in bytes */
	response_size_bytes?: number
	/** Content-Type of the request */
	request_content_type?: string
	/** Content-Type of the response */
	response_content_type?: string
	/** Query string (without leading ?) */
	query_string?: string
	/** Route pattern (e.g., /api/users/:id) */
	route?: string
	/** User-Agent header */
	user_agent?: string
	/** Referer header */
	referer?: string
	/** Client IP address */
	client_ip?: string
	/** Forwarded-For header (if behind proxy) */
	forwarded_for?: string
	/** Host header */
	host?: string
}

/**
 * User context fields for wide events.
 */
export interface UserFields {
	/** User identifier */
	id?: string
	/** User email (consider sanitization) */
	email?: string
	/** Username or display name */
	name?: string
	/** Subscription tier (free, pro, enterprise, etc.) */
	subscription?: string
	/** Account age in days */
	account_age_days?: number
	/** Lifetime value in cents */
	lifetime_value_cents?: number
	/** Organization/team ID */
	organization_id?: string
	/** User role */
	role?: string
	/** Session identifier */
	session_id?: string
}

/**
 * Performance metrics fields for wide events.
 */
export interface PerformanceFields {
	/** Total request duration in ms */
	duration_ms?: number
	/** Number of database queries executed */
	db_query_count?: number
	/** Total database query time in ms */
	db_query_time_ms?: number
	/** Number of cache hits */
	cache_hits?: number
	/** Number of cache misses */
	cache_misses?: number
	/** Number of external API calls */
	external_call_count?: number
	/** Total external API call time in ms */
	external_call_time_ms?: number
	/** Memory used in bytes */
	memory_used_bytes?: number
	/** CPU time in ms */
	cpu_time_ms?: number
}

/**
 * Error fields for wide events.
 */
export interface ErrorFields {
	/** Error type/class name */
	type?: string
	/** Error code */
	code?: string | number
	/** Error message */
	message?: string
	/** Whether the error is retryable */
	retriable?: boolean
	/** Provider-specific error code (e.g., Stripe decline code) */
	provider_code?: string
	/** Number of retry attempts */
	retry_count?: number
}

/**
 * Service/infrastructure fields for wide events.
 */
export interface ServiceFields {
	/** Service name */
	name?: string
	/** Service version */
	version?: string
	/** Deployment/release identifier */
	deployment_id?: string
	/** Git commit SHA */
	git_sha?: string
	/** Cloud region */
	region?: string
	/** Availability zone */
	availability_zone?: string
	/** Host/container name */
	host?: string
	/** Kubernetes namespace */
	k8s_namespace?: string
	/** Kubernetes pod name */
	k8s_pod?: string
	/** Environment (production, staging, development) */
	environment?: string
}

/**
 * Feature flag fields for wide events.
 */
export interface FeatureFlagFields {
	/** Map of feature flag name to enabled status */
	[flagName: string]: boolean | string | number | undefined
}

/**
 * Complete HTTP request event fields structure.
 *
 * This interface represents all the categories of fields
 * typically captured for an HTTP request wide event.
 *
 * Note: Fields are typed as Record<string, unknown> for compatibility
 * with WideEventFields, but the individual field interfaces above
 * provide documentation for expected field names and types.
 */
export interface HttpRequestEventFields {
	http?: Record<string, unknown>
	user?: Record<string, unknown>
	performance?: Record<string, unknown>
	error?: Record<string, unknown>
	service?: Record<string, unknown>
	feature_flags?: Record<string, unknown>
	[category: string]: Record<string, unknown> | undefined
}

/**
 * Helper to create typed HTTP request fields.
 *
 * @example
 * ```typescript
 * const event = createWideEvent({ type: 'http.request' });
 * event.mergeAll(httpFields({
 *   http: { method: 'POST', path: '/api/checkout', status_code: 200 },
 *   user: { id: 'user-123', subscription: 'premium' },
 *   performance: { db_query_count: 3, cache_hits: 2 }
 * }));
 * ```
 */
export function httpFields(fields: Partial<HttpRequestEventFields>): HttpRequestEventFields {
	return fields as HttpRequestEventFields
}

/**
 * Common HTTP event type constants.
 */
export const HTTP_EVENT_TYPES = {
	REQUEST: 'http.request',
	RESPONSE: 'http.response',
	ERROR: 'http.error',
} as const
