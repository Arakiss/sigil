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
 * Extract correlation headers from a Headers object
 */
export function extractCorrelationHeaders(headers: Headers): CorrelationHeaders {
	return {
		requestId: headers.get(CORRELATION_HEADERS.REQUEST_ID) ?? undefined,
		traceId: headers.get(CORRELATION_HEADERS.TRACE_ID) ?? undefined,
		spanId: headers.get(CORRELATION_HEADERS.SPAN_ID) ?? undefined,
	}
}

/**
 * Set correlation headers on a Headers object
 */
export function setCorrelationHeaders(
	headers: Headers,
	context: { requestId?: string; traceId?: string; spanId?: string },
): void {
	if (context.requestId) {
		headers.set(CORRELATION_HEADERS.REQUEST_ID, context.requestId)
	}
	if (context.traceId) {
		headers.set(CORRELATION_HEADERS.TRACE_ID, context.traceId)
	}
	if (context.spanId) {
		headers.set(CORRELATION_HEADERS.SPAN_ID, context.spanId)
	}
}

/**
 * Create a new Headers object with correlation headers added
 */
export function withCorrelationHeaders(
	existingHeaders: Headers | Record<string, string>,
	context: { requestId?: string; traceId?: string; spanId?: string },
): Headers {
	const headers = new Headers(existingHeaders as HeadersInit)
	setCorrelationHeaders(headers, context)
	return headers
}
