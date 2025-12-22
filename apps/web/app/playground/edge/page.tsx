import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Container } from '@/components/layout'
import { Flash, Search, Settings, Shuffle, PlugTypeA, Check, Xmark } from 'iconoir-react'
import { getLogger, getRequestContext } from '@vestig/next'
import { IS_SERVER, RUNTIME, CAPABILITIES, IS_EDGE } from 'vestig'

// Force edge runtime for this page
export const runtime = 'edge'

/**
 * Edge Runtime Demo Page
 *
 * Demonstrates logging in Edge Runtime (Vercel Edge, Cloudflare Workers).
 */
export default async function EdgePage() {
	const log = await getLogger('edge-demo')
	const ctx = await getRequestContext()

	log.info('Edge Runtime demo page rendering', {
		route: '/playground/edge',
		runtime: RUNTIME,
		isServer: IS_SERVER,
		isEdge: IS_EDGE,
		requestId: ctx.requestId,
	})

	// Log capabilities available in this runtime
	log.debug('Runtime capabilities', {
		hasAsyncLocalStorage: CAPABILITIES.hasAsyncLocalStorage,
		hasProcess: CAPABILITIES.hasProcess,
		hasPerformance: CAPABILITIES.hasPerformance,
		hasConsole: CAPABILITIES.hasConsole,
		hasCrypto: CAPABILITIES.hasCrypto,
	})

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Flash className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">Edge Runtime</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Lightweight logging in Edge Functions and Middleware. Vestig automatically adapts to the
					edge environment with reduced bundle size.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* Runtime detection */}
			<DemoCard
				title="Runtime Detection"
				description="Vestig automatically detects the edge environment"
				icon={<Search className="h-5 w-5" />}
			>
				<DemoResult>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Runtime:</span>{' '}
							<span className="text-foreground font-mono">{RUNTIME}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Is Edge:</span>{' '}
							<span className="font-mono text-foreground">{IS_EDGE ? 'true' : 'false'}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Request ID:</span>{' '}
							<span className="text-foreground/70 font-mono text-xs">{ctx.requestId}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Trace ID:</span>{' '}
							<span className="text-foreground/70 font-mono text-xs">{ctx.traceId}</span>
						</div>
					</div>
				</DemoResult>
			</DemoCard>

			{/* Capabilities */}
			<div className="mt-6">
				<DemoCard
					title="Runtime Capabilities"
					description="APIs available in the current edge environment"
					icon={<Settings className="h-5 w-5" />}
				>
					<DemoResult>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
							{Object.entries(CAPABILITIES).map(([key, value]) => (
								<div
									key={key}
									className={`flex items-center gap-2 px-3 py-2 ${
										value ? 'bg-white/10' : 'bg-white/5'
									}`}
								>
									{value ? (
										<Check className="h-4 w-4 text-foreground" />
									) : (
										<Xmark className="h-4 w-4 text-muted-foreground" />
									)}
									<span className={value ? 'text-foreground' : 'text-muted-foreground'}>
										{key.replace('has', '')}
									</span>
								</div>
							))}
						</div>
					</DemoResult>
				</DemoCard>
			</div>

			{/* Edge middleware example */}
			<div className="mt-6">
				<DemoCard
					title="Edge Middleware"
					description="How to use vestig in Next.js Edge Middleware"
					icon={<Shuffle className="h-5 w-5" />}
					code={`// middleware.ts
import { createVestigMiddleware } from '@vestig/next/middleware'

export const middleware = createVestigMiddleware({
  // Skip static assets and API routes
  skipPaths: ['/_next', '/favicon.ico', '/api/health'],

  // Custom request ID header
  requestIdHeader: 'x-request-id',

  // Log levels for requests/responses
  requestLogLevel: 'debug',
  responseLogLevel: 'info',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}`}
				/>
			</div>

			{/* Edge function example */}
			<div className="mt-6">
				<DemoCard
					title="Edge API Route"
					description="Logging in Edge API routes with correlation"
					icon={<PlugTypeA className="h-5 w-5" />}
					code={`// app/api/edge-example/route.ts
import { withVestig } from '@vestig/next'

export const runtime = 'edge'

export const GET = withVestig(
  async (request, { log, ctx }) => {
    log.info('Edge API request received', {
      requestId: ctx.requestId,
      geo: request.geo, // Vercel Edge geo data
    })

    // Your edge logic here
    const data = await fetchFromEdgeCache()

    log.debug('Response ready', { cached: !!data })

    return Response.json(data)
  },
  { namespace: 'api:edge-example' }
)`}
				/>
			</div>

			{/* Edge considerations */}
			<div className="mt-8 relative p-6 bg-surface border border-white/[0.06] overflow-hidden">
				<div className="absolute top-0 right-0 w-12 h-12 border-l border-b border-white/[0.04]" />
				<h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
					<span className="text-amber-400/80">!</span> Edge Considerations
				</h3>
				<ul className="text-sm text-white/50 space-y-2">
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">No File System</strong> — FileTransport is not
							available in edge runtime
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Limited APIs</strong> — Some Node.js APIs like
							process.env may be restricted
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Global Context</strong> — Uses global context
							manager instead of AsyncLocalStorage
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Bundle Size</strong> — Vestig automatically
							tree-shakes unused features
						</span>
					</li>
				</ul>
			</div>

			{/* Key points */}
			<div className="mt-6 relative p-6 bg-surface border border-white/[0.06] overflow-hidden">
				<div className="absolute top-0 right-0 w-12 h-12 border-l border-b border-white/[0.04]" />
				<h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
					<span className="text-white/50">—</span> Key Features
				</h3>
				<ul className="text-sm text-white/50 space-y-2">
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Zero Config</strong> — Works automatically in Vercel
							Edge and Cloudflare Workers
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Auto Detection</strong> — Vestig detects edge
							runtime and adapts accordingly
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Correlation IDs</strong> — Request correlation works
							across edge and origin
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Minimal Bundle</strong> — Tree-shakeable design
							keeps edge bundles small
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Same API</strong> — Use the same logging API as
							server and client
						</span>
					</li>
				</ul>
			</div>
		</Container>
	)
}
