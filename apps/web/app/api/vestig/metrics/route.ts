import { withVestig } from '@vestig/next'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Web Vitals metric schema
 * Based on the web-vitals library metric structure
 */
const MetricSchema = z.object({
	name: z.enum(['CLS', 'INP', 'LCP', 'FCP', 'FID', 'TTFB']),
	value: z.number(),
	rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
	delta: z.number().optional(),
	id: z.string().optional(),
	navigationType: z.string().optional(),
})

const MetricsContextSchema = z.object({
	route: z.string().optional(),
	timestamp: z.number().optional(),
	sessionId: z.string().optional(),
})

const MetricsPayloadSchema = z.object({
	metrics: z.union([MetricSchema, z.array(MetricSchema)]),
	context: MetricsContextSchema.optional(),
})

/**
 * Web Vitals metrics endpoint
 *
 * Receives performance metrics from the client and logs them
 * using Vestig for observability. In production, you might
 * forward these to an analytics service like Datadog or New Relic.
 */
export const POST = withVestig(
	async (request, { log, ctx, timing }) => {
		// Validate Content-Type header
		const contentType = request.headers.get('content-type')
		if (!contentType?.includes('application/json')) {
			log.warn('Invalid Content-Type for metrics', { contentType })
			return NextResponse.json(
				{ error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE' },
				{ status: 415 },
			)
		}

		try {
			// Parse request body
			const rawBody = await request.json()

			// Validate with Zod schema
			const parseResult = MetricsPayloadSchema.safeParse(rawBody)

			if (!parseResult.success) {
				log.warn('Invalid metrics payload', {
					errors: parseResult.error.issues.map((i) => ({
						path: i.path.join('.'),
						message: i.message,
					})),
				})
				return NextResponse.json(
					{
						error: 'Validation failed',
						code: 'VALIDATION_ERROR',
						details: parseResult.error.issues.map((i) => ({
							field: i.path.join('.'),
							message: i.message,
						})),
					},
					{ status: 400 },
				)
			}

			const { metrics, context } = parseResult.data
			const metricsArray = Array.isArray(metrics) ? metrics : [metrics]

			// Log received metrics with context
			log.info('Web Vitals metrics received', {
				metricsCount: metricsArray.length,
				route: context?.route || 'unknown',
				userAgent: request.headers.get('user-agent')?.slice(0, 100),
			})

			// Log individual metrics at debug level for detailed analysis
			for (const metric of metricsArray) {
				log.debug('Metric received', {
					name: metric.name,
					value: metric.value,
					rating: metric.rating,
					route: context?.route,
				})
			}

			// In production, forward to your analytics service:
			// await sendToAnalytics(metrics)

			log.debug('Metrics processed successfully', {
				durationMs: timing.elapsed().toFixed(2),
			})

			return NextResponse.json({
				success: true,
				requestId: ctx.requestId,
				processedAt: new Date().toISOString(),
			})
		} catch (error) {
			// Determine error type for better diagnostics
			const isParseError = error instanceof SyntaxError
			const errorCode = isParseError ? 'PARSE_ERROR' : 'INTERNAL_ERROR'
			const statusCode = isParseError ? 400 : 500

			// Log full details internally (stack trace for debugging)
			log.error('Failed to process metrics', {
				error: error instanceof Error ? error.message : String(error),
				errorCode,
				durationMs: timing.elapsed().toFixed(2),
				// Stack trace logged internally only, not exposed in response
				stack: error instanceof Error ? error.stack : undefined,
			})

			// Return sanitized error response (no stack traces)
			return NextResponse.json(
				{
					error: isParseError ? 'Invalid JSON payload' : 'Failed to process metrics',
					code: errorCode,
					requestId: ctx.requestId,
				},
				{ status: statusCode },
			)
		}
	},
	{ namespace: 'api:metrics' },
)

export const dynamic = 'force-dynamic'
