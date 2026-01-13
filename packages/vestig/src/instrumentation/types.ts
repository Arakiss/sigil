/**
 * Types for auto-instrumentation
 */

/**
 * Options for instrumenting fetch
 */
export interface InstrumentFetchOptions {
	/**
	 * Prefix for span names
	 * @default 'http.client'
	 * @example 'http.client' → 'http.client GET api.example.com'
	 */
	spanNamePrefix?: string

	/**
	 * Headers to capture as span attributes
	 * Case-insensitive header names
	 * @example ['content-type', 'x-request-id']
	 */
	captureHeaders?: string[]

	/**
	 * URL patterns to ignore (no spans created)
	 * Can be strings (prefix match) or RegExp
	 * @example ['/health', '/metrics', /^\/_next/]
	 */
	ignoreUrls?: (string | RegExp)[]

	/**
	 * Whether to propagate trace context via headers
	 * Adds traceparent header to outgoing requests
	 * @default true
	 */
	propagateContext?: boolean

	/**
	 * Custom span name generator
	 * @param method HTTP method
	 * @param url Full URL
	 * @returns Custom span name
	 */
	spanNameGenerator?: (method: string, url: URL) => string

	/**
	 * Capture request body as span attribute
	 * Warning: May contain sensitive data
	 * @default false
	 */
	captureRequestBody?: boolean

	/**
	 * Maximum request body length to capture (characters)
	 * @default 1024
	 */
	maxRequestBodyLength?: number

	/**
	 * Capture response body as span attribute
	 * Warning: May contain sensitive data
	 * @default false
	 */
	captureResponseBody?: boolean

	/**
	 * Maximum response body length to capture (characters)
	 * @default 1024
	 */
	maxResponseBodyLength?: number

	/**
	 * Additional attributes to add to all spans
	 * @example { 'app.version': '1.0.0' }
	 */
	defaultAttributes?: Record<string, unknown>
}

/**
 * Internal state for fetch instrumentation
 */
export interface FetchInstrumentationState {
	/**
	 * Whether fetch has been instrumented
	 */
	isInstrumented: boolean

	/**
	 * Original fetch function (for restore)
	 */
	originalFetch: typeof globalThis.fetch | null

	/**
	 * Current options
	 */
	options: InstrumentFetchOptions | null
}
