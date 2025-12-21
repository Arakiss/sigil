import type { LogEntry, LogLevel } from '../types'

/**
 * Sampler function signature
 * Returns true if the log entry should be included, false to drop
 */
export type SamplerFn = (entry: LogEntry) => boolean

/**
 * Configuration for probability-based sampling
 */
export interface ProbabilitySamplerConfig {
	/** Sampling probability (0-1). 1 = 100%, 0.1 = 10% */
	probability: number
}

/**
 * Configuration for rate-limiting sampling
 */
export interface RateLimitSamplerConfig {
	/** Maximum logs per second */
	maxPerSecond: number
	/** Bucket size in milliseconds (default: 1000) */
	windowMs?: number
}

/**
 * Configuration for namespace-based sampling
 */
export interface NamespaceSamplerConfig {
	/** Default sampling config for all namespaces */
	default?: SamplerConfig
	/** Namespace-specific overrides (supports wildcards like 'api.*') */
	namespaces?: Record<string, SamplerConfig>
}

/**
 * Combined sampler configuration
 */
export type SamplerConfig =
	| number // Shorthand for probability (0-1)
	| ProbabilitySamplerConfig
	| RateLimitSamplerConfig
	| NamespaceSamplerConfig

/**
 * Full sampling configuration for the logger
 */
export interface SamplingConfig {
	/** Enable/disable sampling (default: false) */
	enabled?: boolean
	/** Sampler configuration */
	sampler?: SamplerConfig
	/** Always sample errors regardless of sampler (default: true) */
	alwaysSampleErrors?: boolean
	/** Minimum log level to bypass sampling (default: 'error') */
	bypassLevel?: LogLevel
}

/**
 * Sampler instance interface
 */
export interface Sampler {
	/** Check if a log entry should be sampled (included) */
	shouldSample(entry: LogEntry): boolean
	/** Optional cleanup method */
	destroy?(): void
}
