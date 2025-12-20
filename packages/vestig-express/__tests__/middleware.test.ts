import { describe, it, expect, beforeEach, mock, spyOn } from 'bun:test'
import express, { type Request, type Response, type NextFunction } from 'express'
import { createVestigMiddleware, vestigMiddleware } from '../src/middleware'
import type { VestigRequest } from '../src/types'

// Mock request/response factory
function createMockReq(overrides: Partial<Request> = {}): Request {
	const req = {
		method: 'GET',
		path: '/test',
		originalUrl: '/test',
		url: '/test',
		query: {},
		headers: {},
		ip: '127.0.0.1',
		...overrides,
	} as unknown as Request
	return req
}

function createMockRes(): Response & { _events: Record<string, () => void> } {
	const events: Record<string, () => void> = {}
	const res = {
		statusCode: 200,
		statusMessage: 'OK',
		headersSent: false,
		_events: events,
		on(event: string, handler: () => void) {
			events[event] = handler
			return this
		},
		setHeader: mock(() => res),
		getHeader: mock(() => undefined),
	} as unknown as Response & { _events: Record<string, () => void> }
	return res
}

describe('createVestigMiddleware', () => {
	it('creates middleware function', () => {
		const middleware = createVestigMiddleware()
		expect(typeof middleware).toBe('function')
	})

	it('calls next() to continue the chain', async () => {
		const middleware = createVestigMiddleware()
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)

		// Give time for withContextAsync to execute
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(next).toHaveBeenCalled()
	})

	it('attaches vestig context to request', async () => {
		const middleware = createVestigMiddleware()
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(req.vestig).toBeDefined()
		expect(req.vestig?.log).toBeDefined()
		expect(req.vestig?.ctx).toBeDefined()
		expect(req.vestig?.ctx.requestId).toBeDefined()
		expect(req.vestig?.timing).toBeDefined()
	})

	it('extracts request-id from header', async () => {
		const middleware = createVestigMiddleware()
		const req = createMockReq({
			headers: { 'x-request-id': 'custom-request-id-123' },
		}) as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(req.vestig?.ctx.requestId).toBe('custom-request-id-123')
	})

	it('parses traceparent header', async () => {
		const middleware = createVestigMiddleware()
		const traceparent = '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
		const req = createMockReq({
			headers: { traceparent },
		}) as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(req.vestig?.ctx.traceId).toBe('0af7651916cd43dd8448eb211c80319c')
		expect(req.vestig?.ctx.spanId).toBe('b7ad6b7169203331')
	})

	it('skips configured paths', async () => {
		const middleware = createVestigMiddleware({
			skipPaths: ['/health', '/metrics'],
		})
		const req = createMockReq({ path: '/health' }) as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)

		expect(next).toHaveBeenCalled()
		expect(req.vestig).toBeUndefined()
	})

	it('sets correlation headers on response', async () => {
		const middleware = createVestigMiddleware()
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(res.setHeader).toHaveBeenCalled()
	})

	it('logs response on finish event', async () => {
		const middleware = createVestigMiddleware({ timing: true })
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		// Trigger the finish event
		expect(res._events.finish).toBeDefined()
		res._events.finish()
	})

	it('provides timing utilities', async () => {
		const middleware = createVestigMiddleware()
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(req.vestig?.timing.start).toBeGreaterThan(0)
		expect(typeof req.vestig?.timing.elapsed).toBe('function')
		expect(typeof req.vestig?.timing.mark).toBe('function')
		expect(typeof req.vestig?.timing.getMark).toBe('function')

		const elapsed = req.vestig?.timing.elapsed()
		expect(elapsed).toBeGreaterThanOrEqual(0)
	})

	it('respects custom namespace', async () => {
		const middleware = createVestigMiddleware({ namespace: 'custom-api' })
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		middleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(req.vestig?.log).toBeDefined()
	})
})

describe('vestigMiddleware (default)', () => {
	it('is a pre-configured middleware instance', () => {
		expect(typeof vestigMiddleware).toBe('function')
	})

	it('works as middleware', async () => {
		const req = createMockReq() as VestigRequest
		const res = createMockRes()
		const next = mock(() => {})

		vestigMiddleware(req, res, next)
		await new Promise((resolve) => setTimeout(resolve, 10))

		expect(next).toHaveBeenCalled()
		expect(req.vestig).toBeDefined()
	})
})
