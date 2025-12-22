'use client'

import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
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
					<div className="mb-4 p-3 bg-white/5 border border-white/10 text-xs text-white/50">
						<span className="text-amber-400/80">!</span> This request includes: email, password, and
						creditCard fields. Check the log panel to see them sanitized
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
			<div className="mt-8 relative p-6 bg-surface border border-white/[0.06] overflow-hidden">
				<div className="absolute top-0 right-0 w-12 h-12 border-l border-b border-white/[0.04]" />
				<h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
					<span className="text-white/50">—</span> Key Features
				</h3>
				<ul className="text-sm text-white/50 space-y-2">
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Request Lifecycle</strong> — Full tracing from
							request to response
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Correlation IDs</strong> — Request ID and Trace ID
							propagation
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Response Headers</strong> — IDs returned for
							client-side tracing
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Duration Tracking</strong> — Performance metrics
							logged automatically
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Error Handling</strong> — Errors logged with context
							preserved
						</span>
					</li>
				</ul>
			</div>
		</Container>
	)
}
