import { describe, expect, test } from 'bun:test'
import { extractRequestMetadata, extractResponseMetadata } from '../../utils/metadata'

// Helper to create a mock NextRequest
function createMockRequest(
	url: string,
	options: {
		method?: string
		headers?: Record<string, string>
		ip?: string
	} = {}
): Request & { nextUrl?: URL; ip?: string } {
	const request = new Request(url, {
		method: options.method ?? 'GET',
		headers: new Headers(options.headers ?? {}),
	}) as Request & { nextUrl?: URL; ip?: string }

	request.nextUrl = new URL(url)
	request.ip = options.ip

	return request
}

describe('extractRequestMetadata', () => {
	test('should extract method', () => {
		const request = createMockRequest('https://example.com/api/test', {
			method: 'POST',
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.method).toBe('POST')
	})

	test('should extract path from nextUrl', () => {
		const request = createMockRequest('https://example.com/api/users/123')

		const metadata = extractRequestMetadata(request)

		expect(metadata.path).toBe('/api/users/123')
	})

	test('should extract path from URL fallback', () => {
		const request = new Request('https://example.com/api/test') as Request & {
			nextUrl?: URL
			ip?: string
		}
		// No nextUrl set, should use request.url

		const metadata = extractRequestMetadata(request)

		expect(metadata.path).toBe('/api/test')
	})

	test('should extract search params', () => {
		const request = createMockRequest('https://example.com/api/test?foo=bar&baz=qux')

		const metadata = extractRequestMetadata(request)

		expect(metadata.search).toBe('?foo=bar&baz=qux')
	})

	test('should return undefined for empty search', () => {
		const request = createMockRequest('https://example.com/api/test')

		const metadata = extractRequestMetadata(request)

		expect(metadata.search).toBeUndefined()
	})

	test('should extract IP from x-forwarded-for', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.ip).toBe('192.168.1.1')
	})

	test('should extract IP from x-forwarded-for with trimming', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'x-forwarded-for': '  192.168.1.1  , 10.0.0.1' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.ip).toBe('192.168.1.1')
	})

	test('should extract IP from request.ip as fallback', () => {
		const request = createMockRequest('https://example.com/api/test', {
			ip: '10.0.0.1',
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.ip).toBe('10.0.0.1')
	})

	test('should truncate long userAgent to 200 chars', () => {
		const longUserAgent = 'A'.repeat(300)
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'user-agent': longUserAgent },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.userAgent).toHaveLength(203) // 200 + '...'
		expect(metadata.userAgent?.endsWith('...')).toBe(true)
	})

	test('should not truncate short userAgent', () => {
		const shortUserAgent = 'Mozilla/5.0 (Test)'
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'user-agent': shortUserAgent },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.userAgent).toBe(shortUserAgent)
	})

	test('should extract referer', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { referer: 'https://google.com' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.referer).toBe('https://google.com')
	})

	test('should extract contentType', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'content-type': 'application/json' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.contentType).toBe('application/json')
	})

	test('should parse contentLength as number', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'content-length': '1234' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.contentLength).toBe(1234)
	})

	test('should return undefined for invalid contentLength', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { 'content-length': 'not-a-number' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.contentLength).toBeUndefined()
	})

	test('should extract origin', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { origin: 'https://example.com' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.origin).toBe('https://example.com')
	})

	test('should extract host', () => {
		const request = createMockRequest('https://example.com/api/test', {
			headers: { host: 'example.com' },
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.host).toBe('example.com')
	})

	test('should handle all fields together', () => {
		const request = createMockRequest('https://example.com/api/test?query=value', {
			method: 'POST',
			headers: {
				'x-forwarded-for': '192.168.1.1',
				'user-agent': 'TestAgent/1.0',
				referer: 'https://example.com',
				'content-type': 'application/json',
				'content-length': '100',
				origin: 'https://example.com',
				host: 'example.com',
			},
		})

		const metadata = extractRequestMetadata(request)

		expect(metadata.method).toBe('POST')
		expect(metadata.path).toBe('/api/test')
		expect(metadata.search).toBe('?query=value')
		expect(metadata.ip).toBe('192.168.1.1')
		expect(metadata.userAgent).toBe('TestAgent/1.0')
		expect(metadata.referer).toBe('https://example.com')
		expect(metadata.contentType).toBe('application/json')
		expect(metadata.contentLength).toBe(100)
		expect(metadata.origin).toBe('https://example.com')
		expect(metadata.host).toBe('example.com')
	})
})

describe('extractResponseMetadata', () => {
	test('should extract status', () => {
		const response = new Response(null, { status: 200 })

		const metadata = extractResponseMetadata(response)

		expect(metadata.status).toBe(200)
	})

	test('should extract statusText', () => {
		const response = new Response(null, { status: 404, statusText: 'Not Found' })

		const metadata = extractResponseMetadata(response)

		expect(metadata.statusText).toBe('Not Found')
	})

	test('should extract contentType', () => {
		const response = new Response('{}', {
			headers: { 'content-type': 'application/json' },
		})

		const metadata = extractResponseMetadata(response)

		expect(metadata.contentType).toBe('application/json')
	})

	test('should parse contentLength as number', () => {
		const response = new Response('hello', {
			headers: { 'content-length': '5' },
		})

		const metadata = extractResponseMetadata(response)

		expect(metadata.contentLength).toBe(5)
	})

	test('should return undefined for missing contentLength', () => {
		const response = new Response('hello')

		const metadata = extractResponseMetadata(response)

		expect(metadata.contentLength).toBeUndefined()
	})

	test('should handle all fields together', () => {
		const response = new Response('{"data": "test"}', {
			status: 201,
			statusText: 'Created',
			headers: {
				'content-type': 'application/json',
				'content-length': '16',
			},
		})

		const metadata = extractResponseMetadata(response)

		expect(metadata.status).toBe(201)
		expect(metadata.statusText).toBe('Created')
		expect(metadata.contentType).toBe('application/json')
		expect(metadata.contentLength).toBe(16)
	})
})
