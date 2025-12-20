import { describe, it, expect, mock } from 'bun:test'
import type { Request, Response } from 'express'
import {
	CORRELATION_HEADERS,
	extractCorrelationHeaders,
	setCorrelationHeaders,
	getTraceparent,
} from '../src/utils/headers'
import { createRequestTiming, formatDuration } from '../src/utils/timing'
import { extractRequestInfo, extractResponseInfo } from '../src/utils/request-info'

// Mock request factory
function createMockReq(overrides: Partial<Request> = {}): Request {
	return {
		method: 'POST',
		path: '/api/test',
		originalUrl: '/api/test?foo=bar',
		url: '/api/test',
		query: {},
		headers: {},
		ip: '192.168.1.1',
		...overrides,
	} as unknown as Request
}

// Mock response factory
function createMockRes(overrides: Partial<Response> = {}): Response {
	return {
		statusCode: 200,
		statusMessage: 'OK',
		setHeader: mock(() => {}),
		getHeader: mock(() => undefined),
		...overrides,
	} as unknown as Response
}

describe('CORRELATION_HEADERS', () => {
	it('has expected header names', () => {
		expect(CORRELATION_HEADERS.REQUEST_ID).toBe('x-request-id')
		expect(CORRELATION_HEADERS.TRACE_ID).toBe('x-trace-id')
		expect(CORRELATION_HEADERS.SPAN_ID).toBe('x-span-id')
		expect(CORRELATION_HEADERS.TRACEPARENT).toBe('traceparent')
	})
})

describe('extractCorrelationHeaders', () => {
	it('extracts x-request-id header', () => {
		const req = createMockReq({
			headers: { 'x-request-id': 'req-123' },
		})

		const result = extractCorrelationHeaders(req)

		expect(result.requestId).toBe('req-123')
	})

	it('extracts x-trace-id header', () => {
		const req = createMockReq({
			headers: { 'x-trace-id': 'trace-456' },
		})

		const result = extractCorrelationHeaders(req)

		expect(result.traceId).toBe('trace-456')
	})

	it('extracts x-span-id header', () => {
		const req = createMockReq({
			headers: { 'x-span-id': 'span-789' },
		})

		const result = extractCorrelationHeaders(req)

		expect(result.spanId).toBe('span-789')
	})

	it('handles array header values', () => {
		const req = createMockReq({
			headers: { 'x-request-id': ['first', 'second'] },
		})

		const result = extractCorrelationHeaders(req)

		expect(result.requestId).toBe('first')
	})

	it('returns undefined for missing headers', () => {
		const req = createMockReq()

		const result = extractCorrelationHeaders(req)

		expect(result.requestId).toBeUndefined()
		expect(result.traceId).toBeUndefined()
		expect(result.spanId).toBeUndefined()
	})
})

describe('setCorrelationHeaders', () => {
	it('sets correlation headers on response', () => {
		const res = createMockRes()
		const ctx = {
			requestId: 'req-abc',
			traceId: 'trace-def',
			spanId: 'span-ghi',
		}

		setCorrelationHeaders(res, ctx)

		expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-abc')
		expect(res.setHeader).toHaveBeenCalledWith('x-trace-id', 'trace-def')
		expect(res.setHeader).toHaveBeenCalledWith('x-span-id', 'span-ghi')
	})

	it('only sets headers for defined values', () => {
		const res = createMockRes()
		const ctx = { requestId: 'req-only' }

		setCorrelationHeaders(res, ctx)

		expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-only')
		expect(res.setHeader).toHaveBeenCalledTimes(1)
	})
})

describe('getTraceparent', () => {
	it('extracts traceparent header', () => {
		const req = createMockReq({
			headers: { traceparent: '00-abc123-def456-01' },
		})

		const result = getTraceparent(req)

		expect(result).toBe('00-abc123-def456-01')
	})

	it('handles array values', () => {
		const req = createMockReq({
			headers: { traceparent: ['first-parent', 'second-parent'] },
		})

		const result = getTraceparent(req)

		expect(result).toBe('first-parent')
	})

	it('returns undefined when missing', () => {
		const req = createMockReq()

		const result = getTraceparent(req)

		expect(result).toBeUndefined()
	})
})

describe('createRequestTiming', () => {
	it('creates timing object with start time', () => {
		const timing = createRequestTiming()

		expect(timing.start).toBeGreaterThan(0)
	})

	it('elapsed returns time since start', async () => {
		const timing = createRequestTiming()

		await new Promise((resolve) => setTimeout(resolve, 10))

		const elapsed = timing.elapsed()
		expect(elapsed).toBeGreaterThan(0)
	})

	it('mark records named timestamps', () => {
		const timing = createRequestTiming()

		timing.mark('db-query')

		const mark = timing.getMark('db-query')
		expect(mark).toBeGreaterThan(0)
	})

	it('getMark returns undefined for unknown marks', () => {
		const timing = createRequestTiming()

		const mark = timing.getMark('unknown')

		expect(mark).toBeUndefined()
	})

	it('complete returns total duration', async () => {
		const timing = createRequestTiming()

		await new Promise((resolve) => setTimeout(resolve, 10))

		const duration = timing.complete()
		expect(duration).toBeGreaterThan(0)
	})
})

describe('formatDuration', () => {
	it('formats milliseconds with 2 decimal places', () => {
		const result = formatDuration(123.456)

		expect(result).toBe('123.46ms')
	})

	it('formats small durations as microseconds', () => {
		const result = formatDuration(0.5)

		expect(result).toBe('500μs')
	})

	it('formats large durations as seconds', () => {
		const result = formatDuration(5000)

		expect(result).toBe('5.00s')
	})
})

describe('extractRequestInfo', () => {
	it('extracts basic request info', () => {
		const req = createMockReq({
			method: 'GET',
			path: '/api/users',
			originalUrl: '/api/users?page=1',
		})

		const info = extractRequestInfo(req)

		expect(info.method).toBe('GET')
		expect(info.path).toBe('/api/users')
		expect(info.url).toBe('/api/users?page=1')
	})

	it('extracts query parameters when present', () => {
		const req = createMockReq({
			query: { page: '1', limit: '10' },
		})

		const info = extractRequestInfo(req)

		expect(info.query).toEqual({ page: '1', limit: '10' })
	})

	it('excludes query when empty', () => {
		const req = createMockReq({ query: {} })

		const info = extractRequestInfo(req)

		expect(info.query).toBeUndefined()
	})

	it('extracts IP from x-forwarded-for', () => {
		const req = createMockReq({
			headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1' },
		})

		const info = extractRequestInfo(req)

		expect(info.ip).toBe('10.0.0.1')
	})

	it('extracts IP from x-real-ip', () => {
		const req = createMockReq({
			headers: { 'x-real-ip': '172.16.0.1' },
		})

		const info = extractRequestInfo(req)

		expect(info.ip).toBe('172.16.0.1')
	})

	it('falls back to req.ip', () => {
		const req = createMockReq({ ip: '127.0.0.1' })

		const info = extractRequestInfo(req)

		expect(info.ip).toBe('127.0.0.1')
	})

	it('extracts and truncates user agent', () => {
		const longUserAgent = 'A'.repeat(200)
		const req = createMockReq({
			headers: { 'user-agent': longUserAgent },
		})

		const info = extractRequestInfo(req)

		expect(info.userAgent).toBe('A'.repeat(100))
	})
})

describe('extractResponseInfo', () => {
	it('extracts status code', () => {
		const res = createMockRes({ statusCode: 201 })

		const info = extractResponseInfo(res)

		expect(info.statusCode).toBe(201)
	})

	it('extracts status message', () => {
		const res = createMockRes({ statusMessage: 'Created' })

		const info = extractResponseInfo(res)

		expect(info.statusMessage).toBe('Created')
	})

	it('extracts numeric content-length', () => {
		const res = createMockRes({
			getHeader: mock(() => 1234),
		})

		const info = extractResponseInfo(res)

		expect(info.contentLength).toBe(1234)
	})

	it('parses string content-length', () => {
		const res = createMockRes({
			getHeader: mock(() => '5678'),
		})

		const info = extractResponseInfo(res)

		expect(info.contentLength).toBe(5678)
	})

	it('handles missing content-length', () => {
		const res = createMockRes({
			getHeader: mock(() => undefined),
		})

		const info = extractResponseInfo(res)

		expect(info.contentLength).toBeUndefined()
	})
})
