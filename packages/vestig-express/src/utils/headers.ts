import type { Request, Response } from 'express'

/**
 * Standard correlation headers used by vestig
 */
export const CORRELATION_HEADERS = {
	REQUEST_ID: 'x-request-id',
	TRACE_ID: 'x-trace-id',
	SPAN_ID: 'x-span-id',
	TRACEPARENT: 'traceparent',
} as const

/**
 * Correlation context extracted from headers
 */
export interface CorrelationHeaders {
	requestId?: string
	traceId?: string
	spanId?: string
}

/**
 * Get a header value from Express request (handles array values)
 */
function getHeader(req: Request, name: string): string | undefined {
	const value = req.headers[name.toLowerCase()]
	if (Array.isArray(value)) {
		return value[0]
	}
	return value
}

/**
 * Extract correlation headers from Express request
 */
export function extractCorrelationHeaders(req: Request): CorrelationHeaders {
	return {
		requestId: getHeader(req, CORRELATION_HEADERS.REQUEST_ID),
		traceId: getHeader(req, CORRELATION_HEADERS.TRACE_ID),
		spanId: getHeader(req, CORRELATION_HEADERS.SPAN_ID),
	}
}

/**
 * Set correlation headers on Express response
 */
export function setCorrelationHeaders(
	res: Response,
	context: { requestId?: string; traceId?: string; spanId?: string },
): void {
	if (context.requestId) {
		res.setHeader(CORRELATION_HEADERS.REQUEST_ID, context.requestId)
	}
	if (context.traceId) {
		res.setHeader(CORRELATION_HEADERS.TRACE_ID, context.traceId)
	}
	if (context.spanId) {
		res.setHeader(CORRELATION_HEADERS.SPAN_ID, context.spanId)
	}
}

/**
 * Get traceparent header from request
 */
export function getTraceparent(req: Request): string | undefined {
	return getHeader(req, CORRELATION_HEADERS.TRACEPARENT)
}
