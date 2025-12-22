'use client'

import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/layout'
import { PlugTypeA, Download, Upload, Code } from 'iconoir-react'
import { useState } from 'react'
import { IS_SERVER, RUNTIME } from 'vestig'

interface ApiResponse {
	status: number
	data: unknown
	requestId?: string
	traceId?: string
	duration?: number
}

/**
 * API Routes Demo Page
 *
 * This page demonstrates logging in Next.js API Routes.
 * Includes GET and POST examples with correlation IDs.
 */
export default function ApiRoutesDemoPage() {
	const [getResponse, setGetResponse] = useState<ApiResponse | null>(null)
	const [postResponse, setPostResponse] = useState<ApiResponse | null>(null)
	const [isLoading, setIsLoading] = useState({ get: false, post: false })

	// Make GET request to demo API
	const handleGetRequest = async () => {
		setIsLoading((prev) => ({ ...prev, get: true }))
		const start = performance.now()

		try {
			const res = await fetch('/api/demo')
			const data = await res.json()
			const duration = performance.now() - start

			setGetResponse({
				status: res.status,
				data,
				requestId: res.headers.get('X-Request-Id') || undefined,
				traceId: res.headers.get('X-Trace-Id') || undefined,
				duration,
			})
		} catch (error) {
			setGetResponse({
				status: 500,
				data: { error: String(error) },
				duration: performance.now() - start,
			})
		} finally {
			setIsLoading((prev) => ({ ...prev, get: false }))
		}
	}

	// Make POST request to demo API
	const handlePostRequest = async () => {
		setIsLoading((prev) => ({ ...prev, post: true }))
		const start = performance.now()

		try {
			const res = await fetch('/api/demo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: 'Test User',
					email: 'test@example.com',
					password: 'secret123',
					creditCard: '4111111111111111',
				}),
			})
			const data = await res.json()
			const duration = performance.now() - start

			setPostResponse({
				status: res.status,
				data,
				requestId: res.headers.get('X-Request-Id') || undefined,
				traceId: res.headers.get('X-Trace-Id') || undefined,
				duration,
			})
		} catch (error) {
			setPostResponse({
				status: 500,
				data: { error: String(error) },
				duration: performance.now() - start,
			})
		} finally {
			setIsLoading((prev) => ({ ...prev, post: false }))
		}
	}

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<PlugTypeA className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">API Routes</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Full request lifecycle logging with correlation ID propagation in Next.js API Routes.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* GET Request Demo */}
			<DemoCard
				title="GET Request"
				description="Fetches mock user data with full request tracing"
				icon={<Download className="h-5 w-5" />}
				actionLabel={isLoading.get ? 'Loading...' : 'Send GET Request'}
				onAction={handleGetRequest}
				isLoading={isLoading.get}
			>
				{getResponse && (
					<DemoResult title="Response">
						<div className="space-y-2 text-sm">
							<div className="flex gap-2">
								<span className="text-muted-foreground">Status:</span>
								<span className="font-mono text-foreground">{getResponse.status}</span>
							</div>
							<div className="flex gap-2">
								<span className="text-muted-foreground">Duration:</span>
								<span className="font-mono text-foreground">
									{getResponse.duration?.toFixed(2)}ms
								</span>
							</div>
							{getResponse.requestId && (
								<div className="flex gap-2">
									<span className="text-muted-foreground">Request ID:</span>
									<span className="font-mono text-foreground/70 text-xs">
										{getResponse.requestId}
									</span>
								</div>
							)}
							{getResponse.traceId && (
								<div className="flex gap-2">
									<span className="text-muted-foreground">Trace ID:</span>
									<span className="font-mono text-foreground/70 text-xs">
										{getResponse.traceId}
									</span>
								</div>
							)}
							<div className="mt-3 p-3 bg-black/30 overflow-auto">
								<pre className="text-xs text-muted-foreground">
									{JSON.stringify(getResponse.data, null, 2)}
								</pre>
							</div>
						</div>
					</DemoResult>
				)}
			</DemoCard>

			{/* POST Request Demo */}
			<div className="mt-6">
				<DemoCard
					title="POST Request with PII"
					description="Sends sensitive data to the API (watch how it's sanitized in logs)"
					icon={<Upload className="h-5 w-5" />}
					actionLabel={isLoading.post ? 'Loading...' : 'Send POST Request'}
					onAction={handlePostRequest}
					isLoading={isLoading.post}
				>
					<div className="mb-4 p-3 bg-white/5 border border-white/10 text-xs text-muted-foreground">
						⚠️ This request includes: email, password, and creditCard fields. Check the log panel to
						see them sanitized!
					</div>
					<div className="mb-4 p-3 bg-black/30">
						<div className="text-[10px] text-muted-foreground uppercase mb-1">
							Request Body (sent to API)
						</div>
						<pre className="text-xs text-muted-foreground">
							{`{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret123",
  "creditCard": "4111111111111111"
}`}
						</pre>
					</div>
					{postResponse && (
						<DemoResult title="Response">
							<div className="space-y-2 text-sm">
								<div className="flex gap-2">
									<span className="text-muted-foreground">Status:</span>
									<span className="font-mono text-foreground">{postResponse.status}</span>
								</div>
								<div className="flex gap-2">
									<span className="text-muted-foreground">Duration:</span>
									<span className="font-mono text-foreground">
										{postResponse.duration?.toFixed(2)}ms
									</span>
								</div>
								{postResponse.requestId && (
									<div className="flex gap-2">
										<span className="text-muted-foreground">Request ID:</span>
										<span className="font-mono text-foreground/70 text-xs">
											{postResponse.requestId}
										</span>
									</div>
								)}
								<div className="mt-3 p-3 bg-black/30 overflow-auto">
									<pre className="text-xs text-muted-foreground">
										{JSON.stringify(postResponse.data, null, 2)}
									</pre>
								</div>
							</div>
						</DemoResult>
					)}
				</DemoCard>
			</div>

			{/* Code example */}
			<div className="mt-6">
				<DemoCard
					title="Code Example"
					description="How to use vestig in API Routes"
					icon={<Code className="h-5 w-5" />}
					code={`import { serverLogger } from '@/lib/logger'
import { withContext, createCorrelationContext } from 'vestig'

const log = serverLogger.child('api:users')

export async function GET(request: Request) {
  const ctx = createCorrelationContext()

  return withContext(ctx, async () => {
    log.info('API request received', {
      method: 'GET',
      requestId: ctx.requestId,
    })

    const data = await fetchData()

    log.info('API response sent', {
      status: 200,
      itemCount: data.length,
    })

    return Response.json(data, {
      headers: {
        'X-Request-Id': ctx.requestId!,
      },
    })
  })
}`}
				/>
			</div>

			{/* Key points */}
			<Card className="mt-8 bg-white/5 border-white/10">
				<CardContent className="p-6">
					<h3 className="text-sm font-semibold text-foreground mb-3">
						✓ Key Features Demonstrated
					</h3>
					<ul className="text-sm text-muted-foreground space-y-2">
						<li>
							• <strong className="text-foreground">Request Lifecycle</strong> — Full tracing from
							request to response
						</li>
						<li>
							• <strong className="text-foreground">Correlation IDs</strong> — Request ID and Trace
							ID propagation
						</li>
						<li>
							• <strong className="text-foreground">Response Headers</strong> — IDs returned for
							client-side tracing
						</li>
						<li>
							• <strong className="text-foreground">Duration Tracking</strong> — Performance metrics
							logged automatically
						</li>
						<li>
							• <strong className="text-foreground">Error Handling</strong> — Errors logged with
							context preserved
						</li>
					</ul>
				</CardContent>
			</Card>
		</Container>
	)
}
