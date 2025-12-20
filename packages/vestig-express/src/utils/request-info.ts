import type { Request, Response } from 'express'

/**
 * Request information extracted for logging
 */
export interface RequestInfo {
	method: string
	path: string
	url: string
	query?: Record<string, unknown>
	ip?: string
	userAgent?: string
}

/**
 * Response information extracted for logging
 */
export interface ResponseInfo {
	statusCode: number
	statusMessage?: string
	contentLength?: number
}

/**
 * Extract request information for logging
 */
export function extractRequestInfo(req: Request): RequestInfo {
	const query = req.query && Object.keys(req.query).length > 0 ? req.query : undefined

	// Extract IP address with fallback chain
	const forwardedFor = req.headers['x-forwarded-for']
	const realIp = req.headers['x-real-ip']
	let ip: string | undefined

	if (typeof forwardedFor === 'string') {
		ip = forwardedFor.split(',')[0]?.trim()
	} else if (Array.isArray(forwardedFor)) {
		ip = forwardedFor[0]?.split(',')[0]?.trim()
	} else if (typeof realIp === 'string') {
		ip = realIp
	} else if (Array.isArray(realIp)) {
		ip = realIp[0]
	} else {
		ip = req.ip
	}

	// Extract and truncate user agent
	const userAgentHeader = req.headers['user-agent']
	const userAgent =
		typeof userAgentHeader === 'string' ? userAgentHeader.slice(0, 100) : undefined

	return {
		method: req.method,
		path: req.path,
		url: req.originalUrl || req.url,
		query: query as Record<string, unknown> | undefined,
		ip,
		userAgent,
	}
}

/**
 * Extract response information for logging
 */
export function extractResponseInfo(res: Response): ResponseInfo {
	const contentLengthHeader = res.getHeader('content-length')
	let contentLength: number | undefined

	if (typeof contentLengthHeader === 'number') {
		contentLength = contentLengthHeader
	} else if (typeof contentLengthHeader === 'string') {
		contentLength = Number.parseInt(contentLengthHeader, 10)
		if (Number.isNaN(contentLength)) {
			contentLength = undefined
		}
	}

	return {
		statusCode: res.statusCode,
		statusMessage: res.statusMessage || undefined,
		contentLength,
	}
}
