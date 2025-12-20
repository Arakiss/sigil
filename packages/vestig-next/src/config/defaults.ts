import type { VestigNextConfig } from './index'

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
	return process.env.NODE_ENV === 'production'
}

/**
 * Get default configuration values
 */
export function getDefaultConfig(): VestigNextConfig {
	const isProd = isProduction()

	return {
		level: isProd ? 'warn' : 'info',
		enabled: true,
		sanitize: 'default',
		next: {
			endpoint: '/api/vestig',
			middleware: {
				skipPaths: ['/_next', '/favicon.ico', '/api/vestig'],
				requestIdHeader: 'x-request-id',
				timing: true,
				requestLogLevel: 'info',
				responseLogLevel: 'info',
			},
			server: {
				namespace: 'server',
				structured: isProd,
				context: {},
			},
			client: {
				namespace: 'client',
				batchSize: 20,
				flushInterval: 3000,
				includePageInfo: true,
				maxRetries: 3,
				retryDelay: 1000,
			},
			devTools: {
				enabled: !isProd,
				maxLogs: 500,
			},
			transports: [],
		},
	}
}

/**
 * Deep merge two objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
	const result = { ...target } as T

	for (const key in source) {
		const sourceValue = source[key as keyof T]
		const targetValue = target[key as keyof T]

		if (
			sourceValue !== undefined &&
			typeof sourceValue === 'object' &&
			sourceValue !== null &&
			!Array.isArray(sourceValue) &&
			typeof targetValue === 'object' &&
			targetValue !== null &&
			!Array.isArray(targetValue)
		) {
			// Recursively merge objects
			;(result as Record<string, unknown>)[key] = deepMerge(
				targetValue as Record<string, unknown>,
				sourceValue as Record<string, unknown>,
			)
		} else if (sourceValue !== undefined) {
			;(result as Record<string, unknown>)[key] = sourceValue
		}
	}

	return result
}
