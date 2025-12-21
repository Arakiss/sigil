/**
 * Mock implementations for Next.js server types
 * Used for testing middleware, route handlers, and server components
 */

/**
 * Create a mock NextRequest for testing
 */
export function createMockNextRequest(
	url: string,
	options: {
		method?: string
		headers?: Record<string, string>
		body?: string | object
	} = {},
): MockNextRequest {
	const parsedUrl = new URL(url)
	const headers = new Headers(options.headers ?? {})

	const request = {
		method: options.method ?? 'GET',
		url,
		headers,
		nextUrl: {
			pathname: parsedUrl.pathname,
			search: parsedUrl.search,
			searchParams: parsedUrl.searchParams,
			href: parsedUrl.href,
			origin: parsedUrl.origin,
			host: parsedUrl.host,
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			protocol: parsedUrl.protocol,
			hash: parsedUrl.hash,
			toString: () => parsedUrl.toString(),
		},
		ip: headers.get('x-real-ip') ?? undefined,
		geo: {
			city: 'San Francisco',
			country: 'US',
			region: 'CA',
		},
		json: async () => {
			if (typeof options.body === 'object') return options.body
			if (typeof options.body === 'string') return JSON.parse(options.body)
			return {}
		},
		text: async () => {
			if (typeof options.body === 'string') return options.body
			if (typeof options.body === 'object') return JSON.stringify(options.body)
			return ''
		},
		clone: () => createMockNextRequest(url, options),
	}

	return request as MockNextRequest
}

/**
 * Mock NextRequest type
 */
export interface MockNextRequest {
	method: string
	url: string
	headers: Headers
	nextUrl: {
		pathname: string
		search: string
		searchParams: URLSearchParams
		href: string
		origin: string
		host: string
		hostname: string
		port: string
		protocol: string
		hash: string
		toString: () => string
	}
	ip?: string
	geo?: {
		city?: string
		country?: string
		region?: string
	}
	json: () => Promise<unknown>
	text: () => Promise<string>
	clone: () => MockNextRequest
}

/**
 * Mock NextResponse for testing
 */
export class MockNextResponse {
	public readonly status: number
	public readonly statusText: string
	public readonly headers: Headers
	private _body: unknown

	constructor(body?: unknown, init?: ResponseInit) {
		this._body = body
		this.status = init?.status ?? 200
		this.statusText = init?.statusText ?? 'OK'
		this.headers = new Headers(init?.headers)
	}

	static json(data: unknown, init?: ResponseInit) {
		const response = new MockNextResponse(data, init)
		response.headers.set('content-type', 'application/json')
		return response
	}

	static next(options?: { request?: { headers?: Headers } }) {
		const response = new MockNextResponse(null, { status: 200 })
		if (options?.request?.headers) {
			// Store the request headers that would be passed to the next handler
			;(response as MockNextResponseWithRequest)._requestHeaders = options.request.headers
		}
		return response as MockNextResponseWithRequest
	}

	static redirect(url: string | URL, status = 307) {
		const response = new MockNextResponse(null, { status })
		response.headers.set('location', url.toString())
		return response
	}

	static rewrite(url: string | URL) {
		const response = new MockNextResponse(null, { status: 200 })
		response.headers.set('x-middleware-rewrite', url.toString())
		return response
	}

	async json() {
		return this._body
	}

	async text() {
		return typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
	}
}

interface MockNextResponseWithRequest extends MockNextResponse {
	_requestHeaders?: Headers
}

/**
 * Mock RouteContext for route handlers
 */
export interface MockRouteContext {
	params: Promise<Record<string, string>>
}

export function createMockRouteContext(params: Record<string, string> = {}): MockRouteContext {
	return {
		params: Promise.resolve(params),
	}
}
