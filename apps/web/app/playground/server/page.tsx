import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/layout'
import { Server, Search, GitFork, Code } from 'iconoir-react'
import { getLogger, getRequestContext } from '@vestig/next'
import { IS_SERVER, RUNTIME } from 'vestig'

/**
 * Simulated async data fetching with logging
 */
async function fetchUser(id: number, log: Awaited<ReturnType<typeof getLogger>>) {
	log.debug('Fetching user', { userId: id })
	// Simulate network delay
	await new Promise((r) => setTimeout(r, 100))
	const user = {
		id,
		name: 'John Doe',
		email: 'john@example.com',
		role: 'admin',
	}
	log.info('User fetched successfully', { user })
	return user
}

async function fetchPosts(userId: number, log: Awaited<ReturnType<typeof getLogger>>) {
	log.debug('Fetching posts for user', { userId })
	await new Promise((r) => setTimeout(r, 80))
	const posts = [
		{ id: 1, title: 'Hello World' },
		{ id: 2, title: 'Second Post' },
	]
	log.info('Posts fetched', { count: posts.length })
	return posts
}

/**
 * Nested async component with context propagation
 */
async function UserProfile({ userId }: { userId: number }) {
	// Get a namespaced logger for this component (uses React cache, shares context with parent)
	const profileLog = await getLogger('server-demo:profile')

	profileLog.trace('UserProfile component rendering', { userId })

	const user = await fetchUser(userId, profileLog)
	const posts = await fetchPosts(userId, profileLog)

	profileLog.info('UserProfile complete', {
		userId: user.id,
		postCount: posts.length,
	})

	return (
		<div className="bg-surface p-4 border border-white/10">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-10 h-10 bg-white/10 flex items-center justify-center text-foreground font-medium">
					{user.name[0]}
				</div>
				<div>
					<div className="font-medium text-foreground">{user.name}</div>
					<div className="text-sm text-muted-foreground">{user.email}</div>
				</div>
			</div>
			<div className="text-sm text-muted-foreground">
				{posts.length} posts · {user.role}
			</div>
		</div>
	)
}

/**
 * Server Components Demo Page
 *
 * This page demonstrates logging in React Server Components.
 * All logs are generated on the server and streamed to the UI.
 */
export default async function ServerDemoPage() {
	// Get a logger for this page - automatically includes correlation context from middleware
	const log = await getLogger('server-demo')

	// Get the correlation context set by middleware (requestId, traceId, etc.)
	const ctx = await getRequestContext()

	// Log page render start
	log.info('Server Component page rendering', {
		route: '/playground/server',
		runtime: RUNTIME,
		isServer: IS_SERVER,
		requestId: ctx.requestId,
	})

	// Simulate some async work
	await new Promise((r) => setTimeout(r, 50))

	log.trace('Initial render complete, fetching data')

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Server className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">Server Components</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Logging in React Server Components with automatic runtime detection and context
					propagation.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* Runtime info */}
			<DemoCard
				title="Runtime Detection"
				description="Vestig automatically detects the current runtime environment"
				icon={<Search className="h-5 w-5" />}
			>
				<DemoResult>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Runtime:</span>{' '}
							<span className="text-foreground font-mono">{RUNTIME}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Environment:</span>{' '}
							<span className="text-foreground font-mono">{IS_SERVER ? 'Server' : 'Client'}</span>
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

			{/* Nested component demo */}
			<div className="mt-6">
				<DemoCard
					title="Nested Components with Logging"
					description="Child components inherit context and create namespaced logs"
					icon={<GitFork className="h-5 w-5" />}
				>
					<DemoResult title="User Profile Component">
						<UserProfile userId={1} />
					</DemoResult>
				</DemoCard>
			</div>

			{/* Code example */}
			<div className="mt-6">
				<DemoCard
					title="Code Example"
					description="How to use vestig in Server Components with @vestig/next"
					icon={<Code className="h-5 w-5" />}
					code={`import { getLogger, getRequestContext } from '@vestig/next'

export default async function MyServerComponent() {
  // Get logger with automatic request context from middleware
  const log = await getLogger('my-component')
  const ctx = await getRequestContext()

  log.info('Component rendering', {
    requestId: ctx.requestId
  })

  const data = await fetchData()
  log.debug('Data fetched', { count: data.length })

  return <div>...</div>
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
							• <strong className="text-foreground">Runtime Detection</strong> — Automatically
							detects Node.js/Bun environment
						</li>
						<li>
							• <strong className="text-foreground">Structured Logging</strong> — JSON output for
							server-side logs
						</li>
						<li>
							• <strong className="text-foreground">Child Loggers</strong> — Namespaced logging for
							components
						</li>
						<li>
							• <strong className="text-foreground">Context Propagation</strong> — Request IDs
							tracked across async operations
						</li>
						<li>
							• <strong className="text-foreground">Real-time Streaming</strong> — Logs appear in
							the panel below
						</li>
					</ul>
				</CardContent>
			</Card>
		</Container>
	)
}
