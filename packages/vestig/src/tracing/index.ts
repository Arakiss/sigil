/**
 * Vestig Tracing Module
 *
 * Native tracing support for vestig. Create spans to track
 * operations and their relationships, with automatic correlation
 * to logs.
 *
 * @example
 * ```typescript
 * import { span, getActiveSpan } from 'vestig'
 *
 * // Automatic span lifecycle management (recommended)
 * await span('api:request', async (s) => {
 *   s.setAttribute('method', 'GET')
 *
 *   // Nested spans automatically become children
 *   await span('db:query', async (child) => {
 *     child.setAttribute('table', 'users')
 *     return await db.query('SELECT * FROM users')
 *   })
 * })
 *
 * // Manual control when needed
 * const s = startSpan('background-job')
 * try {
 *   await doWork()
 *   s.setStatus('ok')
 * } finally {
 *   endSpan(s)
 * }
 * ```
 */

// Types
export type { Span, SpanEvent, SpanOptions, SpanStatus, SpanCallback, SpanSyncCallback } from './types'

// Span class (for instanceof checks)
export { SpanImpl } from './span'

// Functions
export {
	span,
	spanSync,
	startSpan,
	endSpan,
	getActiveSpan,
	withActiveSpan,
} from './functions'

// Context utilities (for advanced use cases)
export {
	clearActiveSpans,
	getActiveSpanStackDepth,
	withSpanContext,
	withSpanContextAsync,
} from './context'
