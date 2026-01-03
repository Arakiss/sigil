import { withVestig } from '@vestig/next'
import { RUNTIME } from 'vestig'
import { z } from 'zod'

/**
 * Demo API endpoint that demonstrates logging in API Routes
 * using @vestig/next's withVestig wrapper.
 *
 * GET /api/demo - Returns mock data with full logging
 * POST /api/demo - Accepts data and logs the processing
 */

/**
 * Schema for POST request body validation
 * Accepts any object with optional common fields
 */
const DemoRequestSchema = z.object({
	name: z.string().optional(),
	email: z.string().email().optional(),
	message: z.string().max(1000).optional(),
	data: z.record(z.string(), z.unknown()).optional(),
})

export const GET = withVestig(
	async (request, { log, ctx, timing }) => {
		log.info('API request received', {
			method: 'GET',
			url: request.url,
			runtime: RUNTIME,
		})

		try {
			// Simulate database fetch
			log.debug('Fetching data from database')
			await new Promise((r) => setTimeout(r, 100))

			const data = {
				users: [
					{ id: 1, name: 'Alice', email: 'alice@example.com' },
					{ id: 2, name: 'Bob', email: 'bob@example.com' },
				],
				meta: {
					total: 2,
					page: 1,
					requestId: ctx.requestId,
					traceId: ctx.traceId,
				},
			}

			log.debug('Data fetched successfully', { userCount: data.users.length })

			// Simulate some processing
			log.trace('Processing data')
			await new Promise((r) => setTimeout(r, 50))

			log.info('API response sent', {
				status: 200,
				duration: `${timing.elapsed().toFixed(2)}ms`,
				itemCount: data.users.length,
			})

			return Response.json(data, {
				headers: {
					'X-Request-Id': ctx.requestId ?? '',
					'X-Trace-Id': ctx.traceId ?? '',
				},
			})
		} catch (error) {
			log.error('API request failed', {
				error,
				duration: `${timing.elapsed().toFixed(2)}ms`,
			})

			return Response.json(
				{ error: 'Internal server error', requestId: ctx.requestId },
				{ status: 500 },
			)
		}
	},
	{ namespace: 'api:demo', level: 'trace' },
)

export const POST = withVestig(
	async (request, { log, ctx, timing }) => {
		log.info('API POST request received', {
			method: 'POST',
			url: request.url,
		})

		// Validate Content-Type header
		const contentType = request.headers.get('content-type')
		if (!contentType?.includes('application/json')) {
			log.warn('Invalid Content-Type', { contentType })
			return Response.json(
				{ error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE' },
				{ status: 415 },
			)
		}

		try {
			// Parse request body
			log.debug('Parsing request body')
			const rawBody = await request.json()

			// Validate with Zod schema
			log.trace('Validating input with Zod')
			const parseResult = DemoRequestSchema.safeParse(rawBody)

			if (!parseResult.success) {
				log.warn('Request validation failed', {
					errors: parseResult.error.issues.map((i) => ({
						path: i.path.join('.'),
						message: i.message,
					})),
				})
				return Response.json(
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

			const body = parseResult.data

			log.info('Request body validated', {
				fieldCount: Object.keys(body).length,
				fields: Object.keys(body),
			})

			// Log the data (will be sanitized if PII is present)
			log.debug('Processing user data', {
				data: body,
			})

			// Simulate database write
			log.debug('Saving to database')
			await new Promise((r) => setTimeout(r, 100))

			const result = {
				success: true,
				id: Math.floor(Math.random() * 10000),
				requestId: ctx.requestId,
			}

			log.info('POST request completed', {
				status: 201,
				duration: `${timing.elapsed().toFixed(2)}ms`,
				createdId: result.id,
			})

			return Response.json(result, {
				status: 201,
				headers: {
					'X-Request-Id': ctx.requestId ?? '',
					'X-Trace-Id': ctx.traceId ?? '',
				},
			})
		} catch (error) {
			// Determine if it's a JSON parsing error
			const isParseError = error instanceof SyntaxError

			log.error('POST request failed', {
				error: error instanceof Error ? error.message : String(error),
				errorType: isParseError ? 'PARSE_ERROR' : 'INTERNAL_ERROR',
				duration: `${timing.elapsed().toFixed(2)}ms`,
			})

			return Response.json(
				{
					error: isParseError ? 'Invalid JSON payload' : 'Internal server error',
					code: isParseError ? 'PARSE_ERROR' : 'INTERNAL_ERROR',
					requestId: ctx.requestId,
				},
				{ status: isParseError ? 400 : 500 },
			)
		}
	},
	{ namespace: 'api:demo', level: 'trace' },
)
