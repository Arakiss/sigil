import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { createLogger, getContext } from 'vestig'
import type { ErrorHandlerOptions, VestigRequest } from './types'

// Default options
const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
	level: 'error',
	includeStack: true,
	sanitize: 'default',
	namespace: 'error',
	includeCorrelationInResponse: true,
}

/**
 * Create vestig error handler middleware
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { createVestigErrorHandler } from '@vestig/express'
 *
 * const app = express()
 *
 * // ... routes ...
 *
 * // Error handler should be last
 * app.use(createVestigErrorHandler({
 *   includeStack: process.env.NODE_ENV !== 'production',
 * }))
 * ```
 */
export function createVestigErrorHandler(options: ErrorHandlerOptions = {}): ErrorRequestHandler {
	const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

	const logger = createLogger({
		level: mergedOptions.level,
		sanitize: mergedOptions.sanitize,
		namespace: mergedOptions.namespace,
	})

	return function vestigErrorHandler(
		err: Error,
		req: Request,
		res: Response,
		_next: NextFunction,
	): void {
		const vestigReq = req as VestigRequest

		// Get correlation context
		const ctx = vestigReq.vestig?.ctx ?? getContext() ?? {}

		// Extract error details
		const errorDetails: Record<string, unknown> = {
			name: err.name,
			message: err.message,
		}

		if (mergedOptions.includeStack && err.stack) {
			errorDetails.stack = err.stack
		}

		// Check for HTTP status code on error
		const statusCode =
			(err as unknown as { statusCode?: number }).statusCode ??
			(err as unknown as { status?: number }).status ??
			500

		// Log the error
		logger.error('Unhandled error', {
			error: errorDetails,
			method: req.method,
			path: req.path,
			url: req.originalUrl,
			statusCode,
			requestId: ctx.requestId,
			traceId: ctx.traceId,
		})

		// Build error response
		const errorResponse: Record<string, unknown> = {
			error: {
				message: err.message,
				...(mergedOptions.includeStack && process.env.NODE_ENV !== 'production'
					? { stack: err.stack }
					: {}),
			},
		}

		// Include correlation IDs in response if enabled
		if (mergedOptions.includeCorrelationInResponse && ctx.requestId) {
			errorResponse.requestId = ctx.requestId
			if (ctx.traceId) {
				errorResponse.traceId = ctx.traceId
			}
		}

		// Send error response
		if (!res.headersSent) {
			res.status(statusCode).json(errorResponse)
		}
	}
}

/**
 * Pre-configured vestig error handler for direct use
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { vestigErrorHandler } from '@vestig/express'
 *
 * const app = express()
 * // ... routes ...
 * app.use(vestigErrorHandler)
 * ```
 */
export const vestigErrorHandler: ErrorRequestHandler = createVestigErrorHandler()

/**
 * Create a 404 Not Found handler with logging
 *
 * @example
 * ```typescript
 * import { createNotFoundHandler } from '@vestig/express'
 *
 * // Place before error handler
 * app.use(createNotFoundHandler())
 * app.use(vestigErrorHandler)
 * ```
 */
export function createNotFoundHandler(message = 'Not Found') {
	const logger = createLogger({ namespace: 'http' })

	return function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
		const vestigReq = req as VestigRequest
		const ctx = vestigReq.vestig?.ctx ?? getContext() ?? {}

		logger.warn('Route not found', {
			method: req.method,
			path: req.path,
			url: req.originalUrl,
			requestId: ctx.requestId,
		})

		const response: Record<string, unknown> = {
			error: {
				message,
				path: req.path,
			},
		}

		if (ctx.requestId) {
			response.requestId = ctx.requestId
		}

		res.status(404).json(response)
	}
}

/**
 * Pre-configured 404 Not Found handler
 */
export const notFoundHandler = createNotFoundHandler()
