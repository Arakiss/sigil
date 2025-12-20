import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import type { Logger, LogLevel, LogContext, SanitizePreset } from 'vestig'

/**
 * Options for configuring the vestig middleware
 */
export interface MiddlewareOptions {
	/** Log level for the middleware logger */
	level?: LogLevel
	/** Enable/disable logging */
	enabled?: boolean
	/** PII sanitization preset */
	sanitize?: SanitizePreset
	/** Namespace for middleware logs */
	namespace?: string
	/** Paths to skip (prefix matching) */
	skipPaths?: string[]
	/** Custom header name for request ID */
	requestIdHeader?: string
	/** Enable request/response timing logs */
	timing?: boolean
	/** Log level for incoming requests */
	requestLogLevel?: LogLevel
	/** Log level for outgoing responses */
	responseLogLevel?: LogLevel
	/** Use structured JSON output */
	structured?: boolean
}

/**
 * Context provided to route handlers wrapped with withVestig
 */
export interface RouteHandlerContext {
	/** Logger instance (child of middleware logger) */
	log: Logger
	/** Correlation context with request/trace IDs */
	ctx: LogContext
	/** Request timing utilities */
	timing: {
		/** Start timestamp (performance.now()) */
		start: number
		/** Get elapsed time in milliseconds */
		elapsed: () => number
		/** Mark a checkpoint */
		mark: (name: string) => void
		/** Get a marked checkpoint time */
		getMark: (name: string) => number | undefined
	}
}

/**
 * Options for route handler wrapper
 */
export interface RouteHandlerOptions {
	/** Namespace for the route logger */
	namespace?: string
	/** Log level */
	level?: LogLevel
	/** Log request on entry */
	logRequest?: boolean
	/** Log response on completion */
	logResponse?: boolean
}

/**
 * Route handler function type with vestig context
 */
export type VestigRouteHandler<T = void> = (
	req: Request,
	res: Response,
	context: RouteHandlerContext,
) => Promise<T> | T

/**
 * Options for error handler middleware
 */
export interface ErrorHandlerOptions {
	/** Log level for errors */
	level?: LogLevel
	/** Include stack trace in logs */
	includeStack?: boolean
	/** PII sanitization preset for error details */
	sanitize?: SanitizePreset
	/** Namespace for error handler logs */
	namespace?: string
	/** Include correlation IDs in error response */
	includeCorrelationInResponse?: boolean
}

/**
 * Extended Express Request with vestig context
 */
export interface VestigRequest extends Request {
	vestig?: {
		log: Logger
		ctx: LogContext
		timing: RouteHandlerContext['timing']
	}
}

/**
 * Request timing interface
 */
export interface RequestTiming {
	start: number
	end?: number
	marks: Map<string, number>
	elapsed: () => number
	mark: (name: string) => void
	getMark: (name: string) => number | undefined
	complete: () => number
}
