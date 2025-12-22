'use client'

import { DemoCard, DemoResult } from '@/app/components/demo-card'
import { FullRuntimeBadge } from '@/app/components/runtime-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Container } from '@/components/layout'
import { Laptop, StatUp, Lock, Code, Play } from 'iconoir-react'
import { useCorrelationContext, useLogger } from '@vestig/next/client'
import { useEffect, useState } from 'react'
import { IS_SERVER, RUNTIME, type Runtime } from 'vestig'

/**
 * Client Components Demo Page
 *
 * This page demonstrates logging in React Client Components (browser).
 * All logs are generated in the browser and sent to the server for unified viewing.
 */
export default function ClientDemoPage() {
	// Get logger from VestigProvider - no useMemo needed, hook handles stability
	const log = useLogger('client-demo')

	// Get correlation context from middleware (passed via VestigProvider)
	const ctx = useCorrelationContext()

	// Runtime detection - use client-side state to avoid hydration mismatch
	// Server renders placeholder, client updates with actual values in useEffect
	const [runtimeInfo, setRuntimeInfo] = useState<{
		runtime: Runtime | 'unknown'
		isServer: boolean
	} | null>(null)

	// Form state for PII demo
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		creditCard: '',
		phone: '',
	})
	const [logCount, setLogCount] = useState(0)

	// Set runtime info on mount (client-side only to avoid hydration mismatch)
	useEffect(() => {
		setRuntimeInfo({ runtime: RUNTIME, isServer: IS_SERVER })
	}, [])

	// Log on mount - include correlation context for tracing
	useEffect(() => {
		log.info('Client component mounted', {
			runtime: RUNTIME,
			isServer: IS_SERVER,
			userAgent: `${navigator.userAgent.slice(0, 50)}...`,
			requestId: ctx.requestId,
		})

		return () => {
			log.debug('Client component unmounting')
		}
	}, [log, ctx.requestId])

	// Handler for form changes with logging
	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
		log.trace('Form field updated', { field, valueLength: value.length })
	}

	// Handler for form submission demo
	const handleSubmit = () => {
		log.info('Form submitted with sensitive data', {
			email: formData.email,
			password: formData.password,
			creditCard: formData.creditCard,
			phone: formData.phone,
		})
		setLogCount((c) => c + 1)
	}

	// Demo: Log at different levels
	const logAtLevel = (level: 'trace' | 'debug' | 'info' | 'warn' | 'error') => {
		const metadata = {
			timestamp: new Date().toISOString(),
			random: Math.random(),
		}

		switch (level) {
			case 'trace':
				log.trace('This is a trace message', metadata)
				break
			case 'debug':
				log.debug('This is a debug message', metadata)
				break
			case 'info':
				log.info('This is an info message', metadata)
				break
			case 'warn':
				log.warn('This is a warning message', metadata)
				break
			case 'error':
				log.error('This is an error message', {
					...metadata,
					error: new Error('Demo error'),
				})
				break
		}
		setLogCount((c) => c + 1)
	}

	// Demo: Simulate user interaction
	const simulateUserFlow = async () => {
		log.info('Starting user flow simulation')

		log.debug('Step 1: User viewing page')
		await new Promise((r) => setTimeout(r, 200))

		log.debug('Step 2: User filling form')
		await new Promise((r) => setTimeout(r, 200))

		log.info('Step 3: User submitting form', {
			formFields: Object.keys(formData),
		})
		await new Promise((r) => setTimeout(r, 200))

		log.info('User flow completed successfully')
		setLogCount((c) => c + 4)
	}

	return (
		<Container size="default">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-4">
					<Laptop className="h-8 w-8 text-foreground" />
					<h1 className="text-2xl font-bold text-foreground">Client Components</h1>
				</div>
				<p className="text-muted-foreground mb-4">
					Browser-side logging with PII sanitization. Logs are sent to the server for unified
					viewing.
				</p>
				{runtimeInfo ? (
					<FullRuntimeBadge runtime={runtimeInfo.runtime} isServer={runtimeInfo.isServer} />
				) : (
					<span className="text-xs text-muted-foreground">Detecting runtime...</span>
				)}
			</div>

			{/* Log level buttons */}
			<DemoCard
				title="Log Levels"
				description="Click buttons to emit logs at different levels"
				icon={<StatUp className="h-5 w-5" />}
			>
				<div className="flex flex-wrap gap-2 mb-4">
					<Button variant="outline" size="sm" onClick={() => logAtLevel('trace')}>
						Trace
					</Button>
					<Button variant="outline" size="sm" onClick={() => logAtLevel('debug')}>
						Debug
					</Button>
					<Button variant="outline" size="sm" onClick={() => logAtLevel('info')}>
						Info
					</Button>
					<Button variant="outline" size="sm" onClick={() => logAtLevel('warn')}>
						Warn
					</Button>
					<Button variant="outline" size="sm" onClick={() => logAtLevel('error')}>
						Error
					</Button>
				</div>
				<div className="text-xs text-muted-foreground">
					Logs emitted: <span className="text-foreground font-mono">{logCount}</span>
				</div>
			</DemoCard>

			{/* PII Sanitization demo */}
			<div className="mt-6">
				<DemoCard
					title="PII Sanitization Demo"
					description="Enter sensitive data and watch it get automatically sanitized in the logs"
					icon={<Lock className="h-5 w-5" />}
				>
					<div className="space-y-4 mb-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								placeholder="user@example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={formData.password}
								onChange={(e) => handleInputChange('password', e.target.value)}
								placeholder="••••••••"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="creditCard">Credit Card</Label>
							<Input
								id="creditCard"
								type="text"
								value={formData.creditCard}
								onChange={(e) => handleInputChange('creditCard', e.target.value)}
								placeholder="4111 1111 1111 1111"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone</Label>
							<Input
								id="phone"
								type="tel"
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
								placeholder="+1 (555) 123-4567"
							/>
						</div>
					</div>
					<Button onClick={handleSubmit} className="w-full">
						Submit (Watch Logs Below)
					</Button>
					<div className="mt-3 p-3 bg-white/5 border border-white/10 text-xs text-white/50">
						<span className="text-amber-400/80">!</span> Sensitive fields like email, password, and
						creditCard are automatically sanitized in the log output
					</div>
				</DemoCard>
			</div>

			{/* User flow simulation */}
			<div className="mt-6">
				<DemoCard
					title="User Flow Simulation"
					description="Simulate a typical user interaction flow with multiple log entries"
					icon={<Play className="h-5 w-5" />}
					actionLabel="Run Simulation"
					onAction={simulateUserFlow}
				/>
			</div>

			{/* Code example */}
			<div className="mt-6">
				<DemoCard
					title="Code Example"
					description="How to use vestig in Client Components with @vestig/next"
					icon={<Code className="h-5 w-5" />}
					code={`'use client'
import { useEffect } from 'react'
import { useLogger, useCorrelationContext } from '@vestig/next/client'

export default function MyClientComponent() {
  // Get logger from VestigProvider - stable reference, no useMemo needed!
  const log = useLogger('my-component')
  const ctx = useCorrelationContext()

  useEffect(() => {
    log.info('Component mounted', { requestId: ctx.requestId })
    return () => log.debug('Component unmounting')
  }, [log, ctx.requestId])

  const handleClick = () => {
    log.info('Button clicked', {
      email: 'user@example.com', // → auto-sanitized!
    })
  }

  return <button onClick={handleClick}>Click me</button>
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
							<strong className="text-white/70">Browser Detection</strong> — Runtime shows as
							'browser'
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">PII Sanitization</strong> — Email, password, credit
							cards are redacted
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Unified Logging</strong> — Client logs appear in the
							same panel as server logs
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">Pretty Console</strong> — Colored output in browser
							devtools
						</span>
					</li>
					<li className="flex gap-2">
						<span className="text-white/30">›</span>
						<span>
							<strong className="text-white/70">No AsyncLocalStorage</strong> — Graceful degradation
							in browser
						</span>
					</li>
				</ul>
			</div>
		</Container>
	)
}
