/**
 * @vestig/express - Express.js middleware integration for vestig logging
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import {
 *   vestigMiddleware,
 *   withVestig,
 *   vestigErrorHandler,
 * } from '@vestig/express'
 *
 * const app = express()
 *
 * // Add vestig middleware (logs requests, sets up correlation context)
 * app.use(vestigMiddleware)
 *
 * // Use withVestig for typed logging in route handlers
 * app.get('/api/users', withVestig(async (req, res, { log, ctx }) => {
 *   log.info('Fetching users', { requestId: ctx.requestId })
 *   res.json({ users: [] })
 * }))
 *
 * // Error handler (should be last)
 * app.use(vestigErrorHandler)
 *
 * app.listen(3000)
 * ```
 */

// Middleware
export { createVestigMiddleware, vestigMiddleware } from './middleware'

// Route handler wrapper
export { withVestig, createRouteHandler } from './route-handler'

// Error handlers
export {
	createVestigErrorHandler,
	vestigErrorHandler,
	createNotFoundHandler,
	notFoundHandler,
} from './error-handler'

// Types
export type {
	MiddlewareOptions,
	RouteHandlerContext,
	RouteHandlerOptions,
	VestigRouteHandler,
	ErrorHandlerOptions,
	VestigRequest,
	RequestTiming,
} from './types'

// Utilities (for advanced use cases)
export { CORRELATION_HEADERS, extractCorrelationHeaders } from './utils/headers'
export { createRequestTiming, formatDuration } from './utils/timing'
export { extractRequestInfo, extractResponseInfo } from './utils/request-info'
