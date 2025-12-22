import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Container } from '@/components/layout'
import { Play, Link as LinkIcon, Code } from 'iconoir-react'
import { getLogger, getRequestContext } from '@vestig/next'
import { IS_SERVER, RUNTIME } from 'vestig'
import { ActionDemo } from './action-demo'

/**
 * Server Actions Demo Page
 *
 * This page demonstrates logging in Next.js Server Actions.
 * Server Actions are functions that run on the server but can be called from client components.
 */
export default async function ActionsPage() {
	const log = await getLogger('actions-demo')
	const ctx = await getRequestContext()

	log.info('Server Actions demo page rendering', {
		route: '/playground/actions',
		runtime: RUNTIME,
		isServer: IS_SERVER,
		requestId: ctx.requestId,
	})

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Play className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">Server Actions</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Logging in Next.js Server Actions with automatic correlation and timing.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* Context info */}
			<DemoCard
				title="Request Context"
				description="Correlation IDs from the current request"
				icon={<LinkIcon className="h-5 w-5" />}
			>
				<DemoResult>
					<div className="grid grid-cols-2 gap-4 text-sm">
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

			{/* Interactive demo */}
			<div className="mt-6">
				<DemoCard
					title="Interactive Demo"
					description="Try calling server actions and watch the logs"
					icon={<Play className="h-5 w-5" />}
				>
					<ActionDemo />
				</DemoCard>
			</div>

			{/* Code example */}
			<div className="mt-6">
				<DemoCard
					title="Code Example"
					description="How to use vestigAction wrapper for server actions"
					icon={<Code className="h-5 w-5" />}
					code={`// app/actions/example.ts
'use server'

import { vestigAction } from '@vestig/next'

export const submitForm = vestigAction(
  async (data: FormData, { log, ctx }) => {
    log.info('Processing form submission', {
      requestId: ctx.requestId,
    })

    const name = data.get('name')
    const email = data.get('email')

    log.debug('Validating input', { name, email })

    // Simulate processing
    await new Promise((r) => setTimeout(r, 500))

    log.info('Form submitted successfully')

    return { success: true, id: crypto.randomUUID() }
  },
  { namespace: 'actions:submitForm' }
)`}
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
							<strong className="text-white/70">vestigAction Wrapper</strong> — Automatic logging
							setup for server actions
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Correlation Propagation</strong> — Request IDs flow
							from client to server action
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Timing Metrics</strong> — Automatic duration
							tracking
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Error Handling</strong> — Errors are logged
							automatically with context
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Input/Output Logging</strong> — Optional logging of
							action inputs and outputs
						</span>
					</li>
				</ul>
			</div>
		</Container>
	)
}
