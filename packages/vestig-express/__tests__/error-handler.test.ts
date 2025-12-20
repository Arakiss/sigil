import { describe, it, expect, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'
import {
	createVestigErrorHandler,
	vestigErrorHandler,
	createNotFoundHandler,
	notFoundHandler,
} from '../src/error-handler'
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

function createMockRes(): Response & { _json?: unknown; _statusCode?: number } {
	const res = {
		statusCode: 200,
		statusMessage: 'OK',
		headersSent: false,
		_json: undefined as unknown,
		_statusCode: undefined as number | undefined,
		json(data: unknown) {
			this._json = data
			return this
		},
		status(code: number) {
			this._statusCode = code
			this.statusCode = code
			return this
		},
		setHeader: mock(() => res),
		getHeader: mock(() => undefined),
	} as unknown as Response & { _json?: unknown; _statusCode?: number }
	return res
}

describe('createVestigErrorHandler', () => {
	it('creates an error handler function', () => {
		const handler = createVestigErrorHandler()
		expect(typeof handler).toBe('function')
	})

	it('logs error and sends response', () => {
		const handler = createVestigErrorHandler()
		const error = new Error('Test error')
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		expect(res._statusCode).toBe(500)
		expect(res._json).toBeDefined()
		expect((res._json as { error: { message: string } }).error.message).toBe('Test error')
	})

	it('uses status code from error.statusCode', () => {
		const handler = createVestigErrorHandler()
		const error = Object.assign(new Error('Not Found'), { statusCode: 404 })
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		expect(res._statusCode).toBe(404)
	})

	it('uses status code from error.status', () => {
		const handler = createVestigErrorHandler()
		const error = Object.assign(new Error('Bad Request'), { status: 400 })
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		expect(res._statusCode).toBe(400)
	})

	it('includes stack trace in non-production when includeStack is true', () => {
		const originalEnv = process.env.NODE_ENV
		process.env.NODE_ENV = 'development'

		const handler = createVestigErrorHandler({ includeStack: true })
		const error = new Error('Test error')
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		const response = res._json as { error: { stack?: string } }
		expect(response.error.stack).toBeDefined()

		process.env.NODE_ENV = originalEnv
	})

	it('excludes stack trace in production', () => {
		const originalEnv = process.env.NODE_ENV
		process.env.NODE_ENV = 'production'

		const handler = createVestigErrorHandler({ includeStack: true })
		const error = new Error('Test error')
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		const response = res._json as { error: { stack?: string } }
		expect(response.error.stack).toBeUndefined()

		process.env.NODE_ENV = originalEnv
	})

	it('includes correlation IDs in response when enabled', () => {
		const handler = createVestigErrorHandler({ includeCorrelationInResponse: true })
		const error = new Error('Test error')
		const req = createMockReq() as VestigRequest
		req.vestig = {
			log: {} as VestigRequest['vestig']['log'],
			ctx: { requestId: 'req-123', traceId: 'trace-456' },
			timing: {
				start: 1000,
				elapsed: () => 5,
				mark: () => {},
				getMark: () => undefined,
			},
		}
		const res = createMockRes()
		const next = mock(() => {})

		handler(error, req, res, next)

		const response = res._json as { requestId?: string; traceId?: string }
		expect(response.requestId).toBe('req-123')
		expect(response.traceId).toBe('trace-456')
	})

	it('does not send response if headers already sent', () => {
		const handler = createVestigErrorHandler()
		const error = new Error('Test error')
		const req = createMockReq()
		const res = createMockRes()
		res.headersSent = true
		const next = mock(() => {})

		handler(error, req, res, next)

		expect(res._json).toBeUndefined()
	})
})

describe('vestigErrorHandler (default)', () => {
	it('is a pre-configured error handler', () => {
		expect(typeof vestigErrorHandler).toBe('function')
	})

	it('handles errors', () => {
		const error = new Error('Test')
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		vestigErrorHandler(error, req, res, next)

		expect(res._statusCode).toBe(500)
	})
})

describe('createNotFoundHandler', () => {
	it('creates a 404 handler', () => {
		const handler = createNotFoundHandler()
		expect(typeof handler).toBe('function')
	})

	it('returns 404 status', () => {
		const handler = createNotFoundHandler()
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(req, res, next)

		expect(res._statusCode).toBe(404)
	})

	it('includes path in response', () => {
		const handler = createNotFoundHandler()
		const req = createMockReq({ path: '/unknown/route' })
		const res = createMockRes()
		const next = mock(() => {})

		handler(req, res, next)

		const response = res._json as { error: { path: string } }
		expect(response.error.path).toBe('/unknown/route')
	})

	it('uses custom message', () => {
		const handler = createNotFoundHandler('Resource not found')
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		handler(req, res, next)

		const response = res._json as { error: { message: string } }
		expect(response.error.message).toBe('Resource not found')
	})

	it('includes requestId when available', () => {
		const handler = createNotFoundHandler()
		const req = createMockReq() as VestigRequest
		req.vestig = {
			log: {} as VestigRequest['vestig']['log'],
			ctx: { requestId: 'req-404' },
			timing: {
				start: 1000,
				elapsed: () => 5,
				mark: () => {},
				getMark: () => undefined,
			},
		}
		const res = createMockRes()
		const next = mock(() => {})

		handler(req, res, next)

		const response = res._json as { requestId?: string }
		expect(response.requestId).toBe('req-404')
	})
})

describe('notFoundHandler (default)', () => {
	it('is a pre-configured 404 handler', () => {
		expect(typeof notFoundHandler).toBe('function')
	})

	it('returns 404', () => {
		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		notFoundHandler(req, res, next)

		expect(res._statusCode).toBe(404)
	})
})
