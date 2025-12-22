import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/layout'
import { MediaVideo, Link as LinkIcon, Play, Code } from 'iconoir-react'
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
					<MediaVideo className="h-8 w-8 text-foreground" />
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
			<Card className="mt-8 bg-white/5 border-white/10">
				<CardContent className="p-6">
					<h3 className="text-sm font-semibold text-foreground mb-3">
						✓ Key Features Demonstrated
					</h3>
					<ul className="text-sm text-muted-foreground space-y-2">
						<li>
							• <strong className="text-foreground">vestigAction Wrapper</strong> — Automatic
							logging setup for server actions
						</li>
						<li>
							• <strong className="text-foreground">Correlation Propagation</strong> — Request IDs
							flow from client to server action
						</li>
						<li>
							• <strong className="text-foreground">Timing Metrics</strong> — Automatic duration
							tracking
						</li>
						<li>
							• <strong className="text-foreground">Error Handling</strong> — Errors are logged
							automatically with context
						</li>
						<li>
							• <strong className="text-foreground">Input/Output Logging</strong> — Optional logging
							of action inputs and outputs
						</li>
					</ul>
				</CardContent>
			</Card>
		</Container>
	)
}
