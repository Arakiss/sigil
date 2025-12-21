import { describe, expect, test } from 'bun:test'
import {
	CORRELATION_HEADERS,
	extractCorrelationHeaders,
	setCorrelationHeaders,
	withCorrelationHeaders,
} from '../../utils/headers'

describe('CORRELATION_HEADERS', () => {
	test('should define correct header names', () => {
		expect(CORRELATION_HEADERS.REQUEST_ID).toBe('x-request-id')
		expect(CORRELATION_HEADERS.TRACE_ID).toBe('x-trace-id')
		expect(CORRELATION_HEADERS.SPAN_ID).toBe('x-span-id')
		expect(CORRELATION_HEADERS.TRACEPARENT).toBe('traceparent')
	})
})

describe('extractCorrelationHeaders', () => {
	test('should extract requestId from headers', () => {
		const headers = new Headers()
		headers.set('x-request-id', 'req-123')

		const result = extractCorrelationHeaders(headers)

		expect(result.requestId).toBe('req-123')
	})

	test('should extract traceId from headers', () => {
		const headers = new Headers()
		headers.set('x-trace-id', 'trace-456')

		const result = extractCorrelationHeaders(headers)

		expect(result.traceId).toBe('trace-456')
	})

	test('should extract spanId from headers', () => {
		const headers = new Headers()
		headers.set('x-span-id', 'span-789')

		const result = extractCorrelationHeaders(headers)

		expect(result.spanId).toBe('span-789')
	})

	test('should extract all correlation headers together', () => {
		const headers = new Headers()
		headers.set('x-request-id', 'req-123')
		headers.set('x-trace-id', 'trace-456')
		headers.set('x-span-id', 'span-789')

		const result = extractCorrelationHeaders(headers)

		expect(result.requestId).toBe('req-123')
		expect(result.traceId).toBe('trace-456')
		expect(result.spanId).toBe('span-789')
	})

	test('should return undefined for missing headers', () => {
		const headers = new Headers()

		const result = extractCorrelationHeaders(headers)

		expect(result.requestId).toBeUndefined()
		expect(result.traceId).toBeUndefined()
		expect(result.spanId).toBeUndefined()
	})

	test('should handle empty headers object', () => {
		const headers = new Headers()

		const result = extractCorrelationHeaders(headers)

		expect(result).toEqual({
			requestId: undefined,
			traceId: undefined,
			spanId: undefined,
		})
	})

	test('should ignore unrelated headers', () => {
		const headers = new Headers()
		headers.set('x-custom-header', 'custom-value')
		headers.set('content-type', 'application/json')

		const result = extractCorrelationHeaders(headers)

		expect(result.requestId).toBeUndefined()
		expect(result.traceId).toBeUndefined()
		expect(result.spanId).toBeUndefined()
	})
})

describe('setCorrelationHeaders', () => {
	test('should set requestId header', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, { requestId: 'req-123' })

		expect(headers.get('x-request-id')).toBe('req-123')
	})

	test('should set traceId header', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, { traceId: 'trace-456' })

		expect(headers.get('x-trace-id')).toBe('trace-456')
	})

	test('should set spanId header', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, { spanId: 'span-789' })

		expect(headers.get('x-span-id')).toBe('span-789')
	})

	test('should set all correlation headers together', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, {
			requestId: 'req-123',
			traceId: 'trace-456',
			spanId: 'span-789',
		})

		expect(headers.get('x-request-id')).toBe('req-123')
		expect(headers.get('x-trace-id')).toBe('trace-456')
		expect(headers.get('x-span-id')).toBe('span-789')
	})

	test('should not set undefined values', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, {
			requestId: 'req-123',
			traceId: undefined,
			spanId: undefined,
		})

		expect(headers.get('x-request-id')).toBe('req-123')
		expect(headers.get('x-trace-id')).toBeNull()
		expect(headers.get('x-span-id')).toBeNull()
	})

	test('should not set empty string values', () => {
		const headers = new Headers()

		setCorrelationHeaders(headers, {
			requestId: '',
			traceId: 'trace-456',
		})

		// Empty string is falsy, so it should not be set
		expect(headers.get('x-request-id')).toBeNull()
		expect(headers.get('x-trace-id')).toBe('trace-456')
	})

	test('should overwrite existing headers', () => {
		const headers = new Headers()
		headers.set('x-request-id', 'old-value')

		setCorrelationHeaders(headers, { requestId: 'new-value' })

		expect(headers.get('x-request-id')).toBe('new-value')
	})
})

describe('withCorrelationHeaders', () => {
	test('should create new Headers with correlation IDs', () => {
		const result = withCorrelationHeaders(new Headers(), {
			requestId: 'req-123',
			traceId: 'trace-456',
		})

		expect(result).toBeInstanceOf(Headers)
		expect(result.get('x-request-id')).toBe('req-123')
		expect(result.get('x-trace-id')).toBe('trace-456')
	})

	test('should preserve existing headers', () => {
		const existingHeaders = new Headers()
		existingHeaders.set('content-type', 'application/json')
		existingHeaders.set('authorization', 'Bearer token')

		const result = withCorrelationHeaders(existingHeaders, {
			requestId: 'req-123',
		})

		expect(result.get('content-type')).toBe('application/json')
		expect(result.get('authorization')).toBe('Bearer token')
		expect(result.get('x-request-id')).toBe('req-123')
	})

	test('should accept Record<string, string> input', () => {
		const existingHeaders: Record<string, string> = {
			'content-type': 'application/json',
			accept: 'application/json',
		}

		const result = withCorrelationHeaders(existingHeaders, {
			requestId: 'req-123',
		})

		expect(result).toBeInstanceOf(Headers)
		expect(result.get('content-type')).toBe('application/json')
		expect(result.get('accept')).toBe('application/json')
		expect(result.get('x-request-id')).toBe('req-123')
	})

	test('should not modify the original headers', () => {
		const originalHeaders = new Headers()
		originalHeaders.set('content-type', 'application/json')

		withCorrelationHeaders(originalHeaders, {
			requestId: 'req-123',
		})

		// Original should not have the new header
		expect(originalHeaders.get('x-request-id')).toBeNull()
	})

	test('should handle empty context', () => {
		const existingHeaders = new Headers()
		existingHeaders.set('content-type', 'application/json')

		const result = withCorrelationHeaders(existingHeaders, {})

		expect(result).toBeInstanceOf(Headers)
		expect(result.get('content-type')).toBe('application/json')
	})
})
