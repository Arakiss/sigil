import { describe, it, expect, mock } from 'bun:test'
import type { Request, Response, NextFunction } from 'express'
import { withVestig, createRouteHandler } from '../src/route-handler'
import type { RouteHandlerContext, VestigRequest } from '../src/types'

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

function createMockRes(): Response {
	const res = {
		statusCode: 200,
		statusMessage: 'OK',
		headersSent: false,
		json: mock(() => res),
		status: mock(() => res),
		send: mock(() => res),
		setHeader: mock(() => res),
		getHeader: mock(() => undefined),
	} as unknown as Response
	return res
}

describe('withVestig', () => {
	it('returns a RequestHandler function', () => {
		const handler = withVestig(async () => {})
		expect(typeof handler).toBe('function')
	})

	it('provides log context to handler', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext).toBeDefined()
		expect(capturedContext?.log).toBeDefined()
		expect(typeof capturedContext?.log.info).toBe('function')
		expect(typeof capturedContext?.log.error).toBe('function')
		expect(typeof capturedContext?.log.debug).toBe('function')
	})

	it('provides correlation context', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.ctx).toBeDefined()
		expect(capturedContext?.ctx.requestId).toBeDefined()
	})

	it('provides timing utilities', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.timing).toBeDefined()
		expect(capturedContext?.timing.start).toBeGreaterThan(0)
		expect(typeof capturedContext?.timing.elapsed).toBe('function')
		expect(typeof capturedContext?.timing.mark).toBe('function')
		expect(typeof capturedContext?.timing.getMark).toBe('function')
	})

	it('uses context from middleware when available', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq() as VestigRequest
		req.vestig = {
			log: { child: mock(() => req.vestig!.log) } as unknown as RouteHandlerContext['log'],
			ctx: { requestId: 'middleware-request-id', traceId: 'trace-123' },
			timing: {
				start: 1000,
				elapsed: () => 5,
				mark: () => {},
				getMark: () => undefined,
			},
		}
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.ctx.requestId).toBe('middleware-request-id')
	})

	it('extracts correlation from headers when middleware not used', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq({
			headers: { 'x-request-id': 'header-request-id' },
		})
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.ctx.requestId).toBe('header-request-id')
	})

	it('calls next(error) when handler throws', async () => {
		const testError = new Error('Test error')

		const handler = withVestig(async () => {
			throw testError
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(next).toHaveBeenCalledWith(testError)
	})

	it('respects custom namespace option', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const handler = withVestig(
			async (_req, _res, context) => {
				capturedContext = context
			},
			{ namespace: 'api:users' },
		)

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.log).toBeDefined()
	})

	it('allows sync handlers', async () => {
		let wasCalled = false

		const handler = withVestig((_req, _res, _context) => {
			wasCalled = true
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(wasCalled).toBe(true)
	})

	it('logs request when logRequest is enabled', async () => {
		const handler = withVestig(async () => {}, { logRequest: true })

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		// Should not throw
		await handler(req, res, next)
	})

	it('logs response when logResponse is enabled', async () => {
		const handler = withVestig(async () => {}, { logResponse: true })

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		// Should not throw
		await handler(req, res, next)
	})
})

describe('createRouteHandler', () => {
	it('creates a route handler factory', () => {
		const apiHandler = createRouteHandler({ namespace: 'api' })
		expect(typeof apiHandler).toBe('function')
	})

	it('applies default options to all handlers', async () => {
		let capturedContext: RouteHandlerContext | undefined

		const apiHandler = createRouteHandler({
			namespace: 'api',
			logRequest: true,
		})

		const handler = apiHandler(async (_req, _res, context) => {
			capturedContext = context
		})

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		await handler(req, res, next)

		expect(capturedContext?.log).toBeDefined()
	})

	it('allows per-handler option overrides', async () => {
		const apiHandler = createRouteHandler({ namespace: 'api' })

		const handler = apiHandler(async () => {}, { namespace: 'api:users' })

		const req = createMockReq()
		const res = createMockRes()
		const next = mock(() => {})

		// Should not throw
		await handler(req, res, next)
	})
})
