import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { createLogger, createCorrelationContext, getContext, withContextAsync } from 'vestig'
import type {
	VestigRouteHandler,
	RouteHandlerOptions,
	RouteHandlerContext,
	VestigRequest,
} from './types'
import { createRequestTiming } from './utils/timing'
import { extractCorrelationHeaders } from './utils/headers'

// Default options
const DEFAULT_OPTIONS: Required<RouteHandlerOptions> = {
	namespace: 'route',
	level: 'info',
	logRequest: false,
	logResponse: false,
}

/**
 * Wrap an Express route handler with vestig logging context
 *
 * @example
 * ```typescript
 * import { withVestig } from '@vestig/express'
 *
 * app.get('/api/users', withVestig(async (req, res, { log, ctx }) => {
 *   log.info('Fetching users', { requestId: ctx.requestId })
 *
 *   const users = await db.users.findMany()
 *   log.debug('Users fetched', { count: users.length })
 *
 *   res.json({ users })
 * }, { namespace: 'api:users' }))
 * ```
 */
export function withVestig<T = void>(
	handler: VestigRouteHandler<T>,
	options: RouteHandlerOptions = {},
): RequestHandler {
	const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const timing = createRequestTiming()
		const vestigReq = req as VestigRequest

		// Try to get context from middleware first, fall back to extracting from headers
		let ctx = vestigReq.vestig?.ctx

		if (!ctx) {
			// Extract correlation IDs from headers if middleware wasn't used
			const correlationHeaders = extractCorrelationHeaders(req)
			ctx = createCorrelationContext({
				requestId: correlationHeaders.requestId,
				traceId: correlationHeaders.traceId,
				spanId: correlationHeaders.spanId,
			})
		}

		// Create logger - use one from middleware if available, otherwise create new
		const baseLogger =
			vestigReq.vestig?.log ??
			createLogger({
				level: mergedOptions.level,
				namespace: mergedOptions.namespace,
			})

		const log = mergedOptions.namespace ? baseLogger.child(mergedOptions.namespace) : baseLogger

		// Build handler context
		const handlerContext: RouteHandlerContext = {
			log,
			ctx,
			timing: {
				start: timing.start,
				elapsed: () => timing.elapsed(),
				mark: (name: string) => timing.mark(name),
				getMark: (name: string) => timing.getMark(name),
			},
		}

		// Log request if enabled
		if (mergedOptions.logRequest) {
			log.debug('Handler started', {
				method: req.method,
				path: req.path,
				requestId: ctx.requestId,
			})
		}

		try {
			// Run handler within context
			await withContextAsync(ctx, async () => {
				await handler(req, res, handlerContext)
			})

			// Log response if enabled
			if (mergedOptions.logResponse) {
				const duration = timing.complete()
				log.debug('Handler completed', {
					method: req.method,
					path: req.path,
					statusCode: res.statusCode,
					durationMs: Math.round(duration * 100) / 100,
					requestId: ctx.requestId,
				})
			}
		} catch (error) {
			// Log error and pass to error handler
			log.error('Handler error', {
				method: req.method,
				path: req.path,
				error,
				requestId: ctx.requestId,
			})
			next(error)
		}
	}
}

/**
 * Create a route handler factory with preset options
 *
 * @example
 * ```typescript
 * const apiHandler = createRouteHandler({ namespace: 'api', logRequest: true })
 *
 * app.get('/users', apiHandler(async (req, res, { log }) => {
 *   log.info('Fetching users')
 *   res.json({ users: [] })
 * }))
 * ```
 */
export function createRouteHandler(defaultOptions: RouteHandlerOptions = {}) {
	return function <T = void>(
		handler: VestigRouteHandler<T>,
		options: RouteHandlerOptions = {},
	): RequestHandler {
		return withVestig(handler, { ...defaultOptions, ...options })
	}
}
