/**
 * Next.js Instrumentation for vestig
 *
 * @example
 * ```typescript
 * // instrumentation.ts
 * import { registerVestig } from '@vestig/next/instrumentation'
 *
 * export function register() {
 *   registerVestig({
 *     serviceName: 'my-app',
 *     otlp: {
 *       endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
 *     },
 *     autoInstrument: {
 *       fetch: true,
 *     },
 *   })
 * }
 * ```
 */

export { registerVestig } from './register'
export type {
	RegisterVestigOptions,
	RegisterVestigResult,
	OTLPConfig,
	AutoInstrumentConfig,
} from './types'
