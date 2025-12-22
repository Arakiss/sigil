import { DemoGrid, DemoLinkCard } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Container } from '@/components/layout'
import { Server, Laptop, PlugTypeA, Flash, MediaVideo, Lock, Antenna } from 'iconoir-react'
import { IS_SERVER, RUNTIME } from 'vestig'

/**
 * Demo categories with their pages
 */
const demos = [
	{
		title: 'Server Components',
		description: 'Logging in React Server Components with automatic runtime detection.',
		icon: <Server className="h-6 w-6" />,
		href: '/playground/server',
		tags: ['RSC', 'node/bun', 'structured'],
	},
	{
		title: 'Client Components',
		description: 'Browser-side logging with PII sanitization and graceful degradation.',
		icon: <Laptop className="h-6 w-6" />,
		href: '/playground/client',
		tags: ['browser', 'sanitization', 'real-time'],
	},
	{
		title: 'API Routes',
		description: 'Full request lifecycle logging with correlation ID propagation.',
		icon: <PlugTypeA className="h-6 w-6" />,
		href: '/playground/api-routes',
		tags: ['node/bun', 'correlation', 'context'],
	},
	{
		title: 'Edge Runtime',
		description: 'Lightweight logging in edge functions and middleware.',
		icon: <Flash className="h-6 w-6" />,
		href: '/playground/edge',
		tags: ['edge', 'vercel', 'cloudflare'],
	},
	{
		title: 'Server Actions',
		description: 'Logging in server actions for form handling and mutations.',
		icon: <MediaVideo className="h-6 w-6" />,
		href: '/playground/actions',
		tags: ['RSC', 'forms', 'mutations'],
	},
	{
		title: 'PII Sanitization',
		description: 'Interactive demo of all sanitization presets side-by-side.',
		icon: <Lock className="h-6 w-6" />,
		href: '/playground/sanitization',
		tags: ['GDPR', 'HIPAA', 'PCI-DSS'],
	},
	{
		title: 'Transports',
		description: 'Multi-transport configuration with HTTP, File, and Datadog.',
		icon: <Antenna className="h-6 w-6" />,
		href: '/playground/transports',
		tags: ['HTTP', 'file', 'datadog'],
	},
]

const stats = [
	{ value: '5', label: 'Runtimes' },
	{ value: '6', label: 'Presets' },
	{ value: '4', label: 'Transports' },
	{ value: '0', label: 'Dependencies' },
]

export default function PlaygroundPage() {
	return (
		<Container size="wide">
			{/* Hero section */}
			<div className="mb-12">
				<div className="flex items-center gap-3 mb-4">
					<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
					<Badge variant="secondary">Interactive</Badge>
				</div>
				<h1 className="text-3xl font-bold text-foreground mb-3">Vestig Playground</h1>
				<p className="text-base text-muted-foreground max-w-2xl">
					Explore vestig's capabilities across all Next.js execution contexts. Each demo shows
					logging in action with real-time log streaming below.
				</p>
			</div>

			{/* Quick stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
				{stats.map((stat) => (
					<Card key={stat.label} className="bg-surface">
						<CardContent className="p-4">
							<div className="text-2xl font-bold text-foreground">{stat.value}</div>
							<div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
								{stat.label}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Demo cards */}
			<div className="mb-8">
				<h2 className="text-lg font-semibold text-foreground mb-4">Demos</h2>
				<DemoGrid>
					{demos.map((demo) => (
						<DemoLinkCard
							key={demo.href}
							title={demo.title}
							description={demo.description}
							icon={demo.icon}
							href={demo.href}
							tags={demo.tags}
						/>
					))}
				</DemoGrid>
			</div>

			{/* Instructions */}
			<Card className="bg-white/5 border-white/10">
				<CardContent className="p-6">
					<div className="flex items-start gap-3">
						<span className="text-lg">💡</span>
						<div>
							<h3 className="text-sm font-semibold text-foreground mb-1">Getting Started</h3>
							<p className="text-sm text-muted-foreground">
								Click on any demo to see vestig in action. Logs appear in real-time in the panel at
								the bottom of the page. Try expanding logs to see metadata and context.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</Container>
	)
}
