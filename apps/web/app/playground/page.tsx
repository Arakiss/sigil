import { DemoGrid, DemoLinkCard } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Container } from '@/components/layout'
import { Server, Laptop, PlugTypeA, Flash, Play, Lock, Antenna, LightBulb } from 'iconoir-react'
import { IS_SERVER, RUNTIME } from 'vestig'

/**
 * Demo categories with their pages
 */
const demos = [
	{
		title: 'Server Components',
		description: 'Logging in React Server Components with automatic runtime detection.',
		icon: <Server className="h-5 w-5" />,
		href: '/playground/server',
		tags: ['RSC', 'node/bun', 'structured'],
		featured: true,
	},
	{
		title: 'Client Components',
		description: 'Browser-side logging with PII sanitization and graceful degradation.',
		icon: <Laptop className="h-5 w-5" />,
		href: '/playground/client',
		tags: ['browser', 'sanitization', 'real-time'],
		featured: true,
	},
	{
		title: 'API Routes',
		description: 'Full request lifecycle logging with correlation ID propagation.',
		icon: <PlugTypeA className="h-5 w-5" />,
		href: '/playground/api-routes',
		tags: ['node/bun', 'correlation', 'context'],
		featured: true,
	},
	{
		title: 'Edge Runtime',
		description: 'Lightweight logging in edge functions and middleware.',
		icon: <Flash className="h-5 w-5" />,
		href: '/playground/edge',
		tags: ['edge', 'vercel', 'cloudflare'],
	},
	{
		title: 'Server Actions',
		description: 'Logging in server actions for form handling and mutations.',
		icon: <Play className="h-5 w-5" />,
		href: '/playground/actions',
		tags: ['RSC', 'forms', 'mutations'],
	},
	{
		title: 'PII Sanitization',
		description: 'Interactive demo of all sanitization presets side-by-side.',
		icon: <Lock className="h-5 w-5" />,
		href: '/playground/sanitization',
		tags: ['GDPR', 'HIPAA', 'PCI-DSS'],
	},
	{
		title: 'Transports',
		description: 'Multi-transport configuration with HTTP, File, and Datadog.',
		icon: <Antenna className="h-5 w-5" />,
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

/**
 * Stat block following Hero pattern
 * Large number + tiny uppercase label
 */
function StatBlock({ value, label }: { value: string; label: string }) {
	return (
		<div className="relative p-4 bg-surface border border-white/[0.06] overflow-hidden group hover:border-white/15 transition-colors">
			{/* Decorative corner */}
			<div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-white/[0.04]" />

			<div className="text-2xl font-semibold text-white">{value}</div>
			<div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{label}</div>
		</div>
	)
}

export default function PlaygroundPage() {
	return (
		<Container size="wide">
			{/* Hero section */}
			<div className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
				<div className="flex items-center gap-3 mb-4">
					<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
					<span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-white/50 uppercase tracking-wider">
						Interactive
					</span>
				</div>
				<h1 className="text-3xl font-bold text-white mb-3">Vestig Playground</h1>
				<p className="text-base text-white/50 max-w-2xl">
					Explore vestig's capabilities across all Next.js execution contexts. Each demo shows
					logging in action with real-time log streaming below.
				</p>
			</div>

			{/* Quick stats - Hero pattern */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500 animation-delay-100">
				{stats.map((stat, index) => (
					<div
						key={stat.label}
						className="animate-in fade-in slide-in-from-bottom-1"
						style={{ animationDelay: `${100 + index * 50}ms` }}
					>
						<StatBlock value={stat.value} label={stat.label} />
					</div>
				))}
			</div>

			{/* Demo cards */}
			<div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 animation-delay-200">
				<h2 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Demos</h2>
				<DemoGrid>
					{demos.map((demo, index) => (
						<div
							key={demo.href}
							className="animate-in fade-in slide-in-from-bottom-1"
							style={{ animationDelay: `${200 + index * 50}ms` }}
						>
							<DemoLinkCard
								title={demo.title}
								description={demo.description}
								icon={demo.icon}
								href={demo.href}
								tags={demo.tags}
								featured={demo.featured}
							/>
						</div>
					))}
				</DemoGrid>
			</div>

			{/* Instructions card */}
			<div className="animate-in fade-in slide-in-from-bottom-2 duration-500 animation-delay-300">
				<div className="relative p-6 bg-surface border border-white/[0.06] overflow-hidden">
					{/* Decorative corners */}
					<div className="absolute top-0 right-0 w-16 h-16 border-l border-b border-white/[0.04]" />
					<div className="absolute bottom-0 left-0 w-10 h-10 border-r border-t border-white/[0.04]" />

					<div className="flex items-start gap-4">
						<div className="p-2 bg-white/5 border border-white/10">
							<LightBulb className="h-4 w-4 text-white/50" />
						</div>
						<div>
							<h3 className="text-sm font-semibold text-white mb-1.5">Getting Started</h3>
							<p className="text-sm text-white/50 leading-relaxed">
								Click on any demo to see vestig in action. Logs appear in real-time in the panel at
								the bottom of the page. Try expanding logs to see metadata and context.
							</p>
						</div>
					</div>
				</div>
			</div>
		</Container>
	)
}
