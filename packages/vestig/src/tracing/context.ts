import { withContext } from '../context'
import type { Span } from './types'

/**
 * Active span stack for tracking nested spans
 *
 * In environments with AsyncLocalStorage, we also propagate
 * the span context through the async context system for
 * proper correlation with logs.
 */
let activeSpanStack: Span[] = []

/**
 * Push a span onto the active span stack
 * @internal
 */
export function pushSpan(span: Span): void {
	activeSpanStack.push(span)
}

/**
 * Pop a span from the active span stack
 * @internal
 */
export function popSpan(): Span | undefined {
	return activeSpanStack.pop()
}

/**
 * Get the currently active span (the one at the top of the stack)
 *
 * @returns The active span, or undefined if no span is active
 *
 * @example
 * ```typescript
 * const active = getActiveSpan()
 * if (active) {
 *   active.addEvent('checkpoint', { step: 3 })
 * }
 * ```
 */
export function getActiveSpan(): Span | undefined {
	return activeSpanStack[activeSpanStack.length - 1]
}

/**
 * Clear all active spans
 * Mainly useful for testing
 * @internal
 */
export function clearActiveSpans(): void {
	activeSpanStack = []
}

/**
 * Get the current stack depth
 * Mainly useful for testing
 * @internal
 */
export function getActiveSpanStackDepth(): number {
	return activeSpanStack.length
}

/**
 * Run a function with the given span as active
 *
 * This pushes the span onto the stack, runs the function,
 * and pops the span when done (even if an error occurs).
 *
 * It also propagates the trace context through the async
 * context system so that logs within the span will have
 * the correct traceId and spanId.
 *
 * @internal
 */
export function withSpanContext<T>(span: Span, fn: () => T): T {
	// Propagate trace context to the logging system
	return withContext({ traceId: span.traceId, spanId: span.spanId }, () => {
		pushSpan(span)
		try {
			return fn()
		} finally {
			popSpan()
		}
	})
}

/**
 * Async version of withSpanContext
 * @internal
 */
export async function withSpanContextAsync<T>(
	span: Span,
	fn: () => Promise<T>
): Promise<T> {
	// Propagate trace context to the logging system
	return withContext({ traceId: span.traceId, spanId: span.spanId }, async () => {
		pushSpan(span)
		try {
			return await fn()
		} finally {
			popSpan()
		}
	})
}
