import type { Request, Response, NextFunction } from 'express'
import {
	type Logger,
	type LogContext,
	createLogger,
	createCorrelationContext,
	parseTraceparent,
	createTraceparent,
	withContextAsync,
} from 'vestig'
import type { MiddlewareOptions, VestigRequest } from './types'
import {
	CORRELATION_HEADERS,
	extractCorrelationHeaders,
	setCorrelationHeaders,
	getTraceparent,
} from './utils/headers'
import { createRequestTiming, formatDuration } from './utils/timing'
import { extractRequestInfo, extractResponseInfo } from './utils/request-info'

// Default options
const DEFAULT_OPTIONS: Required<MiddlewareOptions> = {
	level: 'info',
	enabled: true,
	sanitize: 'default',
	namespace: 'http',
	skipPaths: [],
	requestIdHeader: CORRELATION_HEADERS.REQUEST_ID,
	timing: true,
	requestLogLevel: 'info',
	responseLogLevel: 'info',
	structured: true,
}

// Cached logger per middleware instance
const loggerCache = new WeakMap<MiddlewareOptions, Logger>()

function getOrCreateLogger(options: MiddlewareOptions): Logger {
	const cached = loggerCache.get(options)
	if (cached) return cached

	const logger = createLogger({
		level: options.level,
		enabled: options.enabled,
		sanitize: options.sanitize,
		namespace: options.namespace,
		structured: options.structured,
	})

	loggerCache.set(options, logger)
	return logger
}

/**
 * Create vestig middleware with custom configuration
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { createVestigMiddleware } from '@vestig/express'
 *
 * const app = express()
 *
 * app.use(createVestigMiddleware({
 *   level: 'info',
 *   sanitize: 'gdpr',
 *   skipPaths: ['/health', '/metrics'],
 * }))
 * ```
 */
export function createVestigMiddleware(options: MiddlewareOptions = {}) {
	const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

	return function vestigMiddleware(
		req: VestigRequest,
		res: Response,
		next: NextFunction,
	): void {
		// Skip configured paths
		const pathname = req.path
		if (mergedOptions.skipPaths.some((p) => pathname.startsWith(p))) {
			next()
			return
		}

		const logger = getOrCreateLogger(mergedOptions)
		const log = logger.child('request')
		const timing = createRequestTiming()

		// Extract or generate correlation context
		const existingRequestId =
			(req.headers[mergedOptions.requestIdHeader.toLowerCase()] as string) ?? undefined
		const traceparent = getTraceparent(req)
		const parsed = traceparent ? parseTraceparent(traceparent) : null

		const ctx = createCorrelationContext({
			requestId: existingRequestId,
			traceId: parsed?.traceId,
			spanId: parsed?.spanId,
		})

		// Attach vestig context to request for use in route handlers
		req.vestig = {
			log: log.child(pathname.replace(/\//g, ':')),
			ctx,
			timing: {
				start: timing.start,
				elapsed: () => timing.elapsed(),
				mark: (name: string) => timing.mark(name),
				getMark: (name: string) => timing.getMark(name),
			},
		}

		// Extract request info for logging
		const requestInfo = extractRequestInfo(req)

		// Log incoming request
		log[mergedOptions.requestLogLevel]('Request received', {
			...requestInfo,
			requestId: ctx.requestId,
			traceId: ctx.traceId,
		})

		// Set correlation headers on response
		setCorrelationHeaders(res, ctx)

		// Also set traceparent for downstream services
		if (ctx.traceId && ctx.spanId) {
			res.setHeader(CORRELATION_HEADERS.TRACEPARENT, createTraceparent(ctx.traceId, ctx.spanId))
		}

		// Log response when finished
		res.on('finish', () => {
			if (mergedOptions.timing) {
				const duration = timing.complete()
				const responseInfo = extractResponseInfo(res)

				log[mergedOptions.responseLogLevel]('Response sent', {
					method: requestInfo.method,
					path: requestInfo.path,
					statusCode: responseInfo.statusCode,
					duration: formatDuration(duration),
					durationMs: Math.round(duration * 100) / 100,
					requestId: ctx.requestId,
				})
			}
		})

		// Run the rest of the middleware chain within the correlation context
		// This enables getContext() to work in downstream handlers
		withContextAsync(ctx, async () => {
			next()
		}).catch(next)
	}
}

/**
 * Pre-configured vestig middleware for direct use
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { vestigMiddleware } from '@vestig/express'
 *
 * const app = express()
 * app.use(vestigMiddleware)
 * ```
 */
export const vestigMiddleware = createVestigMiddleware()
