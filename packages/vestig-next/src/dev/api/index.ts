/**
 * Server-side utilities for Vestig Dev Overlay
 *
 * @example
 * ```typescript
 * // app/api/vestig/logs/route.ts
 * import { createLogStreamHandler } from '@vestig/next/dev/api'
 *
 * export const GET = createLogStreamHandler()
 * ```
 */

export {
	createLogStreamHandler,
	createDevTransport,
	devLogEmitter,
	type SSELogEntry,
} from './logs-stream'
