import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout'
import { Antenna, Terminal, Globe, Folder, Database, Shuffle, Settings } from 'iconoir-react'
import { getLogger, getRequestContext } from '@vestig/next'
import { IS_SERVER, RUNTIME } from 'vestig'

/**
 * Transport configurations for demonstration
 */
const transports = [
	{
		name: 'ConsoleTransport',
		icon: <Terminal className="h-6 w-6" />,
		description: 'Output logs to the console with colors and formatting',
		config: `new ConsoleTransport({
  level: 'debug',
  colors: true,
  structured: false, // Pretty print for dev
})`,
		features: ['Color-coded levels', 'Pretty printing', 'JSON mode for prod'],
	},
	{
		name: 'HTTPTransport',
		icon: <Globe className="h-6 w-6" />,
		description: 'Send logs to any HTTP endpoint with batching',
		config: `new HTTPTransport({
  endpoint: 'https://logs.example.com/ingest',
  batchSize: 100,
  flushInterval: 5000,
  headers: {
    'Authorization': 'Bearer \${API_KEY}',
  },
})`,
		features: ['Batch processing', 'Retry with backoff', 'Custom headers'],
	},
	{
		name: 'FileTransport',
		icon: <Folder className="h-6 w-6" />,
		description: 'Write logs to files with rotation and compression',
		config: `new FileTransport({
  filename: './logs/app.log',
  maxSize: '10mb',
  maxFiles: 5,
  compress: true, // gzip old files
})`,
		features: ['Log rotation', 'Gzip compression', 'Size limits'],
	},
	{
		name: 'DatadogTransport',
		icon: <Database className="h-6 w-6" />,
		description: 'Send logs directly to Datadog Log Management',
		config: `new DatadogTransport({
  apiKey: process.env.DD_API_KEY,
  service: 'my-app',
  source: 'nodejs',
  tags: ['env:production'],
})`,
		features: ['Datadog integration', 'Automatic tagging', 'Source mapping'],
	},
]

/**
 * Transports Demo Page
 *
 * Shows multi-transport configuration with HTTP, File, and Datadog.
 */
export default async function TransportsPage() {
	const log = await getLogger('transports-demo')
	const ctx = await getRequestContext()

	log.info('Transports demo page rendering', {
		route: '/playground/transports',
		runtime: RUNTIME,
		isServer: IS_SERVER,
		requestId: ctx.requestId,
	})

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Antenna className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">Transports</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Configure multiple log destinations with different transports. Vestig supports console,
					HTTP, file, and Datadog out of the box.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* Transport cards */}
			<div className="space-y-6">
				{transports.map((transport) => (
					<Card key={transport.name} className="bg-surface overflow-hidden">
						<CardHeader className="bg-surface-elevated">
							<div className="flex items-center gap-3">
								<span className="text-muted-foreground">{transport.icon}</span>
								<div>
									<CardTitle className="text-base">{transport.name}</CardTitle>
									<CardDescription>{transport.description}</CardDescription>
								</div>
							</div>
						</CardHeader>

						<CardContent className="pt-4 space-y-4">
							{/* Config */}
							<div>
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
									Configuration
								</h4>
								<pre className="bg-black/40 p-4 text-sm text-muted-foreground overflow-x-auto border border-white/10">
									{transport.config}
								</pre>
							</div>

							{/* Features */}
							<div>
								<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
									Features
								</h4>
								<div className="flex flex-wrap gap-2">
									{transport.features.map((feature) => (
										<Badge key={feature} variant="secondary">
											{feature}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Multi-transport example */}
			<div className="mt-8">
				<DemoCard
					title="Multi-Transport Configuration"
					description="Send logs to multiple destinations simultaneously"
					icon={<Shuffle className="h-5 w-5" />}
					code={`import {
  createLogger,
  ConsoleTransport,
  HTTPTransport,
  FileTransport,
} from 'vestig'

const log = createLogger({
  level: 'debug',
  transports: [
    // Console for development
    new ConsoleTransport({
      enabled: process.env.NODE_ENV !== 'production',
      colors: true,
    }),

    // HTTP for log aggregation service
    new HTTPTransport({
      endpoint: process.env.LOG_ENDPOINT,
      batchSize: 50,
      headers: {
        'X-API-Key': process.env.LOG_API_KEY,
      },
    }),

    // File for local persistence
    new FileTransport({
      filename: './logs/app.log',
      maxSize: '50mb',
      maxFiles: 10,
    }),
  ],
})

// All transports receive every log
log.info('Application started', { version: '1.0.0' })`}
				/>
			</div>

			{/* Transport options */}
			<div className="mt-8">
				<DemoCard
					title="Common Transport Options"
					description="Options shared across all transport types"
					icon={<Settings className="h-5 w-5" />}
				>
					<DemoResult>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div className="space-y-2">
								<div className="text-muted-foreground">
									<strong className="text-foreground">level</strong> — Minimum log level
								</div>
								<div className="text-muted-foreground">
									<strong className="text-foreground">enabled</strong> — Toggle transport on/off
								</div>
								<div className="text-muted-foreground">
									<strong className="text-foreground">filter</strong> — Custom filter function
								</div>
							</div>
							<div className="space-y-2">
								<div className="text-muted-foreground">
									<strong className="text-foreground">batchSize</strong> — Logs per batch
								</div>
								<div className="text-muted-foreground">
									<strong className="text-foreground">flushInterval</strong> — Auto-flush timing
								</div>
								<div className="text-muted-foreground">
									<strong className="text-foreground">maxRetries</strong> — Retry attempts
								</div>
							</div>
						</div>
					</DemoResult>
				</DemoCard>
			</div>

			{/* Key points */}
			<Card className="mt-8 bg-white/5 border-white/10">
				<CardContent className="p-6">
					<h3 className="text-sm font-semibold text-foreground mb-3">✓ Key Features</h3>
					<ul className="text-sm text-muted-foreground space-y-2">
						<li>
							• <strong className="text-foreground">Multiple Destinations</strong> — Send logs to
							console, files, HTTP, and Datadog simultaneously
						</li>
						<li>
							• <strong className="text-foreground">Batch Processing</strong> — Efficient batching
							with configurable size and flush intervals
						</li>
						<li>
							• <strong className="text-foreground">Retry Logic</strong> — Automatic retries with
							exponential backoff for network transports
						</li>
						<li>
							• <strong className="text-foreground">Level Filtering</strong> — Each transport can
							have its own minimum log level
						</li>
						<li>
							• <strong className="text-foreground">Custom Transports</strong> — Extend
							BatchTransport to create your own
						</li>
					</ul>
				</CardContent>
			</Card>
		</Container>
	)
}
