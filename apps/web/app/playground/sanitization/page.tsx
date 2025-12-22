import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout'
import { Lock, Copy, Code, Search } from 'iconoir-react'
import { getLogger, getRequestContext } from '@vestig/next'
import { IS_SERVER, RUNTIME, Sanitizer, PRESETS, type SanitizePreset } from 'vestig'

/**
 * Sample data containing various types of PII
 */
const sampleData = {
	user: {
		name: 'John Doe',
		email: 'john.doe@example.com',
		password: 'super_secret_123',
		ssn: '123-45-6789',
		phone: '+1 (555) 123-4567',
	},
	payment: {
		cardNumber: '4111-1111-1111-1111',
		cvv: '123',
		expiryDate: '12/25',
		billingAddress: '123 Main St, New York, NY 10001',
	},
	medical: {
		patientId: 'PAT-2024-001',
		diagnosis: 'Common cold',
		medications: ['Acetaminophen', 'Vitamin C'],
		insuranceId: 'INS-987654321',
	},
	api: {
		apiKey: 'sk_live_abc123xyz789',
		secretToken: 'ghp_xxxxxxxxxxxxxxxxxxxx',
		bearerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
	},
}

const presetDescriptions: Record<string, string> = {
	none: 'No sanitization - shows raw data (not recommended for production)',
	minimal: 'Basic sanitization - passwords and secrets only',
	default: 'Standard sanitization - common PII fields and patterns',
	gdpr: 'GDPR compliant - EU personal data protection requirements',
	hipaa: 'HIPAA compliant - Healthcare data protection (US)',
	'pci-dss': 'PCI-DSS compliant - Payment card industry standards',
}

const presetVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
	none: 'outline',
	minimal: 'secondary',
	default: 'default',
	gdpr: 'default',
	hipaa: 'default',
	'pci-dss': 'default',
}

/**
 * PII Sanitization Demo Page
 *
 * Interactive comparison of all sanitization presets side-by-side.
 */
export default async function SanitizationPage() {
	const log = await getLogger('sanitization-demo')
	const ctx = await getRequestContext()

	log.info('PII Sanitization demo page rendering', {
		route: '/playground/sanitization',
		runtime: RUNTIME,
		isServer: IS_SERVER,
		requestId: ctx.requestId,
	})

	// Sanitize the sample data with each preset
	const sanitizedResults = Object.entries(PRESETS).map(([name]) => {
		const sanitizer = Sanitizer.fromPreset(name as SanitizePreset)
		return {
			name,
			description: presetDescriptions[name] || '',
			result: sanitizer.sanitize(sampleData),
		}
	})

	return (
		<Container size="wide">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Lock className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">PII Sanitization</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Compare all sanitization presets side-by-side. See how different compliance requirements
					affect data masking.
				</p>
				<FullRuntimeBadge runtime={RUNTIME} isServer={IS_SERVER} />
			</div>

			{/* Sample data */}
			<DemoCard
				title="Sample Data (Unsanitized)"
				description="This is the raw data that will be sanitized with each preset"
				icon={<Copy className="h-5 w-5" />}
			>
				<DemoResult>
					<pre className="text-xs text-muted-foreground overflow-x-auto">
						{JSON.stringify(sampleData, null, 2)}
					</pre>
				</DemoResult>
			</DemoCard>

			{/* Preset comparisons */}
			<div className="mt-8 space-y-6">
				<h2 className="text-xl font-semibold text-foreground">Preset Comparison</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{sanitizedResults.map(({ name, description, result }) => (
						<Card key={name} className="bg-surface overflow-hidden">
							<CardHeader className="pb-2 bg-surface-elevated">
								<div className="flex items-center gap-2">
									<Badge variant={presetVariants[name] || 'default'}>{name.toUpperCase()}</Badge>
								</div>
								<CardDescription className="mt-1">{description}</CardDescription>
							</CardHeader>
							<CardContent className="pt-4">
								<pre className="text-xs text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto">
									{JSON.stringify(result, null, 2)}
								</pre>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Code example */}
			<div className="mt-8">
				<DemoCard
					title="Code Example"
					description="How to use sanitization presets in your code"
					icon={<Code className="h-5 w-5" />}
					code={`import { createLogger, sanitize } from 'vestig'

// Using preset in logger config
const log = createLogger({
  sanitize: 'gdpr', // or 'hipaa', 'pci-dss', 'default', 'minimal'
})

// All logs automatically sanitized
log.info('User login', {
  email: 'john@example.com',     // → [EMAIL REDACTED]
  password: 'secret123',          // → [REDACTED]
  creditCard: '4111-1111-1111',   // → [CARD REDACTED]
})

// Direct sanitization
const cleanData = sanitize(userData, { preset: 'hipaa' })`}
				/>
			</div>

			{/* Field types */}
			<div className="mt-8">
				<DemoCard
					title="Sanitized Field Types"
					description="Types of data automatically detected and sanitized"
					icon={<Search className="h-5 w-5" />}
				>
					<DemoResult>
						<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
							{[
								'password',
								'email',
								'creditCard',
								'ssn',
								'phone',
								'apiKey',
								'token',
								'secret',
								'address',
							].map((field) => (
								<div
									key={field}
									className="flex items-center justify-center bg-white/5 px-3 py-2 text-muted-foreground"
								>
									{field}
								</div>
							))}
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
							• <strong className="text-foreground">6 Built-in Presets</strong> — From minimal to
							compliance-ready (GDPR, HIPAA, PCI-DSS)
						</li>
						<li>
							• <strong className="text-foreground">Automatic Detection</strong> — Recognizes
							emails, credit cards, SSNs, tokens, and more
						</li>
						<li>
							• <strong className="text-foreground">Deep Object Sanitization</strong> — Recursively
							sanitizes nested objects and arrays
						</li>
						<li>
							• <strong className="text-foreground">Custom Patterns</strong> — Add your own field
							matchers and regex patterns
						</li>
						<li>
							• <strong className="text-foreground">Zero Dependencies</strong> — Lightweight and
							fast, no external libraries
						</li>
					</ul>
				</CardContent>
			</Card>
		</Container>
	)
}
