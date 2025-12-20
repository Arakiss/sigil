/**
 * Request metadata extraction utilities
 */

type NextRequest = Request & { nextUrl?: URL; ip?: string }

/**
 * Metadata extracted from a request
 */
export interface RequestMetadata {
	method: string
	path: string
	search?: string
	ip?: string
	userAgent?: string
	referer?: string
	contentType?: string
	contentLength?: number
	origin?: string
	host?: string
}

/**
 * Extract common metadata from a request
 */
export function extractRequestMetadata(request: NextRequest): RequestMetadata {
	const url = request.nextUrl ?? new URL(request.url)

	return {
		method: request.method,
		path: url.pathname,
		search: url.search || undefined,
		ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.ip,
		userAgent: truncate(request.headers.get('user-agent'), 200),
		referer: request.headers.get('referer') ?? undefined,
		contentType: request.headers.get('content-type') ?? undefined,
		contentLength: parseContentLength(request.headers.get('content-length')),
		origin: request.headers.get('origin') ?? undefined,
		host: request.headers.get('host') ?? undefined,
	}
}

/**
 * Metadata extracted from a response
 */
export interface ResponseMetadata {
	status: number
	statusText: string
	contentType?: string
	contentLength?: number
}

/**
 * Extract common metadata from a response
 */
export function extractResponseMetadata(response: Response): ResponseMetadata {
	return {
		status: response.status,
		statusText: response.statusText,
		contentType: response.headers.get('content-type') ?? undefined,
		contentLength: parseContentLength(response.headers.get('content-length')),
	}
}

function truncate(value: string | null, maxLength: number): string | undefined {
	if (!value) return undefined
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength)}...`
}

function parseContentLength(value: string | null): number | undefined {
	if (!value) return undefined
	const parsed = Number.parseInt(value, 10)
	return Number.isNaN(parsed) ? undefined : parsed
}
