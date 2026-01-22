import { AsyncLocalStorage } from 'node:async_hooks'
import type { WideEventBuilder } from 'vestig'

/**
 * Context for the current wide event in a request
 */
export interface WideEventRequestContext {
	/** The wide event builder for this request */
	event: WideEventBuilder
	/** Request start time for timing */
	startTime: number
}

/**
 * AsyncLocalStorage for request-scoped wide events
 */
const wideEventStorage = new AsyncLocalStorage<WideEventRequestContext>()

/**
 * Get the current wide event from the request context.
 *
 * Returns undefined if called outside of a wide event context
 * (e.g., not in a route handler wrapped with withWideEvent).
 *
 * @returns The current WideEventBuilder or undefined
 *
 * @example
 * ```typescript
 * import { getWideEvent } from '@vestig/next/wide-events'
 *
 * export async function fetchUsers() {
 *   const event = getWideEvent()
 *   if (event) {
 *     event.set('db', 'query', 'users.findMany')
 *     event.set('db', 'count', users.length)
 *   }
 *   return users
 * }
 * ```
 */
export function getWideEvent(): WideEventBuilder | undefined {
	return wideEventStorage.getStore()?.event
}

/**
 * Get the current wide event or throw if not in context.
 *
 * Use this when you expect to always be in a wide event context.
 *
 * @returns The current WideEventBuilder
 * @throws Error if not in a wide event context
 *
 * @example
 * ```typescript
 * import { requireWideEvent } from '@vestig/next/wide-events'
 *
 * export async function createOrder(data: OrderData) {
 *   const event = requireWideEvent()
 *   event.set('order', 'items', data.items.length)
 *   event.set('order', 'total', data.total)
 *   // ...
 * }
 * ```
 */
export function requireWideEvent(): WideEventBuilder {
	const event = getWideEvent()
	if (!event) {
		throw new Error(
			'requireWideEvent() called outside of a wide event context. ' +
				'If using in a server action, wrap your action with withWideEvent(). ' +
				'The middleware context does not automatically propagate to server actions called from the client. ' +
				'See: https://vestig.dev/docs/nextjs/wide-events#server-actions',
		)
	}
	return event
}

/**
 * Get the elapsed time since the request started.
 *
 * @returns Elapsed time in milliseconds, or undefined if not in context
 */
export function getWideEventElapsed(): number | undefined {
	const ctx = wideEventStorage.getStore()
	if (!ctx) return undefined
	return performance.now() - ctx.startTime
}

/**
 * Run a function within a wide event context.
 *
 * @internal Used by middleware and wrappers
 */
export function runWithWideEvent<T>(ctx: WideEventRequestContext, fn: () => T): T {
	return wideEventStorage.run(ctx, fn)
}

/**
 * Run an async function within a wide event context.
 *
 * @internal Used by middleware and wrappers
 */
export async function runWithWideEventAsync<T>(
	ctx: WideEventRequestContext,
	fn: () => Promise<T>,
): Promise<T> {
	return wideEventStorage.run(ctx, fn)
}
