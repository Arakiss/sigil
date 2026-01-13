/**
 * Types for registerVestig
 */

import type { InstrumentFetchOptions, TailSamplingConfig } from 'vestig'

/**
 * OTLP configuration options
 */
export interface OTLPConfig {
	/**
	 * OTLP endpoint URL for traces
	 * Falls back to OTEL_EXPORTER_OTLP_ENDPOINT env var
	 * @example 'https://otel.vercel.com/v1/traces'
	 */
	endpoint?: string

	/**
	 * Custom headers for authentication
	 * Falls back to OTEL_EXPORTER_OTLP_HEADERS env var (comma-separated key=value pairs)
	 * @example { 'Authorization': 'Bearer token' }
	 */
	headers?: Record<string, string>

	/**
	 * Service version (optional)
	 * @example '1.0.0'
	 */
	serviceVersion?: string

	/**
	 * Deployment environment
	 * Falls back to VERCEL_ENV, NODE_ENV
	 * @example 'production', 'development'
	 */
	environment?: string

	/**
	 * Additional resource attributes
	 * @example { 'cloud.region': 'us-east-1' }
	 */
	resourceAttributes?: Record<string, unknown>

	/**
	 * Batch size for span export
	 * @default 100
	 */
	batchSize?: number

	/**
	 * Flush interval in ms
	 * @default 5000
	 */
	flushInterval?: number
}

/**
 * Auto-instrumentation options
 */
export interface AutoInstrumentConfig {
	/**
	 * Auto-instrument all fetch() calls
	 * @default true
	 */
	fetch?: boolean | InstrumentFetchOptions

	/**
	 * Capture console.error as spans
	 * @default false
	 */
	console?: boolean
}

/**
 * Options for registerVestig
 */
export interface RegisterVestigOptions {
	/**
	 * Service name (required)
	 * Used in OTLP resource attributes
	 */
	serviceName: string

	/**
	 * OTLP configuration
	 * If provided, enables automatic span export
	 */
	otlp?: OTLPConfig

	/**
	 * Auto-instrumentation options
	 */
	autoInstrument?: AutoInstrumentConfig

	/**
	 * Tail sampling configuration for wide events
	 */
	tailSampling?: TailSamplingConfig

	/**
	 * Enable debug logging
	 * @default false
	 */
	debug?: boolean
}

/**
 * Result of registerVestig
 */
export interface RegisterVestigResult {
	/**
	 * Whether OTLP export was enabled
	 */
	otlpEnabled: boolean

	/**
	 * Whether fetch was instrumented
	 */
	fetchInstrumented: boolean

	/**
	 * Whether console capture was enabled
	 */
	consoleInstrumented: boolean

	/**
	 * Shutdown function to cleanup resources
	 */
	shutdown: () => Promise<void>
}
