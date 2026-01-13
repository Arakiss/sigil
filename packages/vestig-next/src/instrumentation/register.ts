/**
 * Unified vestig setup for Next.js instrumentation
 *
 * Call in your instrumentation.ts file for complete auto-instrumentation.
 */

import {
	instrumentFetch,
	registerSpanProcessor,
	shutdownSpanProcessors,
	type InstrumentFetchOptions,
} from 'vestig'
import { OTLPExporter } from 'vestig/otlp'
import type {
	AutoInstrumentConfig,
	OTLPConfig,
	RegisterVestigOptions,
	RegisterVestigResult,
} from './types'

/**
 * Parse OTEL headers from environment variable
 * Format: key1=value1,key2=value2
 */
function parseOTLPHeaders(headersStr: string | undefined): Record<string, string> {
	if (!headersStr) return {}

	const headers: Record<string, string> = {}
	const pairs = headersStr.split(',')

	for (const pair of pairs) {
		const [key, ...valueParts] = pair.split('=')
		if (key && valueParts.length > 0) {
			headers[key.trim()] = valueParts.join('=').trim()
		}
	}

	return headers
}

/**
 * Get environment from various sources
 */
function getEnvironment(config?: OTLPConfig): string | undefined {
	return config?.environment ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development'
}

/**
 * Setup OTLP export if configured
 */
function setupOTLP(serviceName: string, config: OTLPConfig | undefined, debug: boolean): boolean {
	// Get endpoint from config or environment
	const endpoint = config?.endpoint ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT

	if (!endpoint) {
		if (debug) {
			console.log('[vestig] OTLP not configured: no endpoint provided')
		}
		return false
	}

	// Ensure endpoint has /v1/traces suffix
	const tracesEndpoint = endpoint.endsWith('/v1/traces')
		? endpoint
		: `${endpoint.replace(/\/$/, '')}/v1/traces`

	// Get headers from config or environment
	const headers = {
		...parseOTLPHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
		...config?.headers,
	}

	// Create and register exporter
	const exporter = new OTLPExporter({
		endpoint: tracesEndpoint,
		serviceName,
		serviceVersion: config?.serviceVersion,
		environment: getEnvironment(config),
		headers: Object.keys(headers).length > 0 ? headers : undefined,
		resourceAttributes: config?.resourceAttributes,
		batchSize: config?.batchSize,
		flushInterval: config?.flushInterval,
	})

	registerSpanProcessor(exporter)

	if (debug) {
		console.log(`[vestig] OTLP enabled: ${tracesEndpoint}`)
	}

	return true
}

/**
 * Setup fetch instrumentation if configured
 */
function setupFetch(config: AutoInstrumentConfig | undefined, debug: boolean): boolean {
	// Default to enabled unless explicitly disabled
	const fetchConfig = config?.fetch

	if (fetchConfig === false) {
		if (debug) {
			console.log('[vestig] Fetch instrumentation disabled')
		}
		return false
	}

	// Determine options
	const options: InstrumentFetchOptions =
		typeof fetchConfig === 'object'
			? fetchConfig
			: {
					// Default options for Next.js
					ignoreUrls: [
						// Next.js internal routes
						/^\/_next/,
						// Health checks
						'/health',
						'/healthz',
						'/ready',
						// Metrics
						'/metrics',
						// Favicon
						'/favicon.ico',
					],
				}

	instrumentFetch(options)

	if (debug) {
		console.log('[vestig] Fetch instrumentation enabled')
	}

	return true
}

/**
 * Setup console capture if configured
 */
function setupConsole(
	config: AutoInstrumentConfig | undefined,
	debug: boolean,
): (() => void) | null {
	if (!config?.console) {
		return null
	}

	// Store original console.error
	const originalError = console.error

	// Wrap console.error to create spans
	console.error = (...args: unknown[]) => {
		// Call original first
		originalError.apply(console, args)

		// Create span for the error (non-blocking)
		// This is a fire-and-forget operation
		try {
			const message = args
				.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
				.join(' ')

			// Import dynamically to avoid circular deps
			import('vestig').then(({ spanSync }) => {
				spanSync('console.error', (s) => {
					s.setAttribute('message', message.slice(0, 1000))
					s.setStatus('error', 'console.error')
				})
			})
		} catch {
			// Ignore errors in instrumentation
		}
	}

	if (debug) {
		console.log('[vestig] Console capture enabled')
	}

	// Return restore function
	return () => {
		console.error = originalError
	}
}

/**
 * Register vestig for Next.js instrumentation
 *
 * Call this in your `instrumentation.ts` file to enable:
 * - OTLP trace export (Vercel, Honeycomb, Jaeger, etc.)
 * - Automatic fetch() instrumentation
 * - Console error capture (optional)
 *
 * @example Basic usage
 * ```typescript
 * // instrumentation.ts
 * import { registerVestig } from '@vestig/next/instrumentation'
 *
 * export function register() {
 *   registerVestig({
 *     serviceName: 'my-app',
 *   })
 * }
 * ```
 *
 * @example With OTLP export
 * ```typescript
 * // instrumentation.ts
 * import { registerVestig } from '@vestig/next/instrumentation'
 *
 * export function register() {
 *   registerVestig({
 *     serviceName: 'my-app',
 *     otlp: {
 *       endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 *       headers: {
 *         'Authorization': `Bearer ${process.env.OTEL_AUTH_TOKEN}`,
 *       },
 *     },
 *   })
 * }
 * ```
 *
 * @example Full configuration
 * ```typescript
 * // instrumentation.ts
 * import { registerVestig } from '@vestig/next/instrumentation'
 *
 * export function register() {
 *   registerVestig({
 *     serviceName: 'my-app',
 *     otlp: {
 *       endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 *       serviceVersion: '1.0.0',
 *       environment: process.env.VERCEL_ENV,
 *     },
 *     autoInstrument: {
 *       fetch: {
 *         captureHeaders: ['content-type', 'x-request-id'],
 *         ignoreUrls: ['/health', /^\/_next/],
 *       },
 *       console: true,
 *     },
 *     debug: process.env.NODE_ENV === 'development',
 *   })
 * }
 * ```
 *
 * @example Environment variables
 * ```bash
 * # These are automatically read if not specified in config:
 * OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.vercel.com/v1/traces
 * OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer token
 * VERCEL_ENV=production
 * ```
 */
export function registerVestig(options: RegisterVestigOptions): RegisterVestigResult {
	const { serviceName, otlp, autoInstrument, debug = false } = options

	if (debug) {
		console.log(`[vestig] Initializing for ${serviceName}...`)
	}

	// Track what was enabled
	let otlpEnabled = false
	let fetchInstrumented = false
	let consoleRestore: (() => void) | null = null

	// Setup OTLP export
	otlpEnabled = setupOTLP(serviceName, otlp, debug)

	// Setup fetch instrumentation
	fetchInstrumented = setupFetch(autoInstrument, debug)

	// Setup console capture
	consoleRestore = setupConsole(autoInstrument, debug)

	if (debug) {
		console.log('[vestig] Initialization complete')
	}

	// Return result with shutdown function
	return {
		otlpEnabled,
		fetchInstrumented,
		consoleInstrumented: consoleRestore !== null,
		shutdown: async () => {
			// Restore console
			if (consoleRestore) {
				consoleRestore()
			}

			// Shutdown span processors (flushes pending spans)
			await shutdownSpanProcessors()

			if (debug) {
				console.log('[vestig] Shutdown complete')
			}
		},
	}
}
