/**
 * Auto-Instrumentation for vestig
 *
 * @example Basic usage
 * ```typescript
 * // instrumentation.ts
 * import { instrumentFetch } from 'vestig'
 *
 * export function register() {
 *   instrumentFetch({
 *     captureHeaders: ['content-type'],
 *     ignoreUrls: ['/health', /^\/_next/],
 *   })
 * }
 * ```
 */

// Fetch instrumentation
export { instrumentFetch, uninstrumentFetch, isFetchInstrumented } from './fetch'

// Types
export type { InstrumentFetchOptions, FetchInstrumentationState } from './types'
