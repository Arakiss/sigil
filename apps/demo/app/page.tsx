import Link from 'next/link'
import { CodeBlock } from './components/code-block'

const quickStartCode = `import { log } from 'vestig'

// Simple logging
log.info('Application started')
log.warn('Cache miss', { key: 'user:123' })
log.error('Request failed', new Error('Timeout'))

// Structured output (JSON)
// {"level":"info","message":"Application started","timestamp":"...","runtime":"bun"}`

const configCode = `import { createLogger } from 'vestig'

const logger = createLogger({
  level: 'debug',
  structured: true,
  sanitize: true,
  context: {
    service: 'api',
    version: '1.0.0'
  }
})

logger.info('Server listening', { port: 3000 })`

const sanitizeCode = `import { log } from 'vestig'

log.info('User login', {
  email: 'user@example.com',    // → us***@example.com
  password: 'secret123',         // → [REDACTED]
  creditCard: '4111111111111111' // → ****1111
})

// Sensitive data is automatically sanitized`

const contextCode = `import { withContext, createCorrelationContext, log } from 'vestig'

app.use((req, res, next) => {
  const ctx = createCorrelationContext()
  // ctx = { requestId, traceId, spanId }

  withContext(ctx, () => {
    log.info('Request received') // Includes correlation IDs
    next()
  })
})`

const features = [
	{
		icon: '🚀',
		title: 'Multi-Runtime',
		description:
			'Works in Node.js, Bun, Deno, Edge runtimes, and browsers with zero configuration.',
	},
	{
		icon: '📊',
		title: 'Structured Output',
		description:
			'JSON logging with timestamps, levels, metadata, and context for easy parsing and analysis.',
	},
	{
		icon: '🔒',
		title: 'PII Sanitization',
		description:
			'Auto-redact passwords, tokens, emails, credit cards, JWTs, and custom sensitive fields.',
	},
	{
		icon: '🔗',
		title: 'Context Propagation',
		description:
			'AsyncLocalStorage-based request tracing with W3C Trace Context compatible correlation IDs.',
	},
	{
		icon: '👶',
		title: 'Child Loggers',
		description: 'Create namespaced loggers with inherited configuration and merged context.',
	},
	{
		icon: '⚡',
		title: 'Zero Dependencies',
		description:
			'Lightweight (<5KB), tree-shakeable, with full TypeScript support and type inference.',
	},
]

export default function Home() {
	return (
		<div className="landing">
			<style>{`
				* { box-sizing: border-box; margin: 0; padding: 0; }

				.landing {
					min-height: 100vh;
					background: #0a0a0a;
					color: #fafafa;
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				}

				.nav {
					position: fixed;
					top: 0;
					left: 0;
					right: 0;
					z-index: 100;
					background: rgba(10,10,10,0.8);
					backdrop-filter: blur(12px);
					border-bottom: 1px solid rgba(255,255,255,0.06);
				}

				.nav-inner {
					max-width: 1200px;
					margin: 0 auto;
					padding: 1rem 2rem;
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				.nav-logo {
					font-size: 1.25rem;
					font-weight: 700;
					background: linear-gradient(135deg, #22d3ee, #a78bfa);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}

				.nav-links {
					display: flex;
					gap: 2rem;
					align-items: center;
				}

				.nav-links a {
					color: #a3a3a3;
					text-decoration: none;
					font-size: 0.9375rem;
					transition: color 0.15s;
				}

				.nav-links a:hover {
					color: #fafafa;
				}

				.nav-cta {
					background: linear-gradient(135deg, #22d3ee, #a78bfa);
					color: #0a0a0a !important;
					padding: 0.5rem 1rem;
					border-radius: 8px;
					font-weight: 600;
				}

				.hero {
					padding: 10rem 2rem 6rem;
					text-align: center;
					background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,119,198,0.15), transparent);
				}

				.hero-badge {
					display: inline-block;
					padding: 0.375rem 1rem;
					background: rgba(34,211,238,0.1);
					border: 1px solid rgba(34,211,238,0.2);
					border-radius: 100px;
					font-size: 0.8125rem;
					color: #22d3ee;
					margin-bottom: 1.5rem;
				}

				.hero h1 {
					font-size: clamp(3rem, 8vw, 5rem);
					font-weight: 800;
					letter-spacing: -0.03em;
					margin-bottom: 1.5rem;
					line-height: 1.1;
				}

				.hero h1 span {
					background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
				}

				.hero-subtitle {
					font-size: 1.25rem;
					color: #737373;
					max-width: 600px;
					margin: 0 auto 2.5rem;
					line-height: 1.6;
				}

				.hero-actions {
					display: flex;
					gap: 1rem;
					justify-content: center;
					flex-wrap: wrap;
				}

				.btn {
					display: inline-flex;
					align-items: center;
					gap: 0.5rem;
					padding: 0.875rem 1.5rem;
					border-radius: 10px;
					font-size: 1rem;
					font-weight: 600;
					text-decoration: none;
					transition: all 0.2s;
				}

				.btn-primary {
					background: linear-gradient(135deg, #22d3ee, #a78bfa);
					color: #0a0a0a;
				}

				.btn-primary:hover {
					transform: translateY(-2px);
					box-shadow: 0 8px 30px rgba(34,211,238,0.3);
				}

				.btn-secondary {
					background: rgba(255,255,255,0.05);
					border: 1px solid rgba(255,255,255,0.1);
					color: #fafafa;
				}

				.btn-secondary:hover {
					background: rgba(255,255,255,0.1);
				}

				.install-cmd {
					margin-top: 3rem;
					display: inline-flex;
					align-items: center;
					gap: 1rem;
					padding: 1rem 1.5rem;
					background: rgba(0,0,0,0.4);
					border: 1px solid rgba(255,255,255,0.08);
					border-radius: 12px;
					font-family: 'SF Mono', Monaco, monospace;
					font-size: 0.9375rem;
				}

				.install-cmd code {
					color: #22d3ee;
				}

				.section {
					max-width: 1200px;
					margin: 0 auto;
					padding: 6rem 2rem;
				}

				.section-header {
					text-align: center;
					margin-bottom: 4rem;
				}

				.section-header h2 {
					font-size: 2.5rem;
					font-weight: 700;
					margin-bottom: 1rem;
				}

				.section-header p {
					color: #737373;
					font-size: 1.125rem;
				}

				.features-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
					gap: 1.5rem;
				}

				.feature-card {
					padding: 2rem;
					background: rgba(255,255,255,0.02);
					border: 1px solid rgba(255,255,255,0.06);
					border-radius: 16px;
					transition: all 0.3s ease;
				}

				.feature-card:hover {
					background: rgba(255,255,255,0.04);
					border-color: rgba(255,255,255,0.12);
					transform: translateY(-4px);
				}

				.feature-icon {
					font-size: 2rem;
					margin-bottom: 1rem;
				}

				.feature-card h3 {
					font-size: 1.25rem;
					font-weight: 600;
					margin-bottom: 0.75rem;
				}

				.feature-card p {
					color: #737373;
					line-height: 1.7;
				}

				.code-examples {
					background: linear-gradient(180deg, rgba(120,119,198,0.05), transparent);
				}

				.code-tabs {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
					gap: 2rem;
				}

				@media (max-width: 600px) {
					.code-tabs { grid-template-columns: 1fr; }
				}

				.code-tab h3 {
					font-size: 1.125rem;
					margin-bottom: 0.5rem;
					color: #fafafa;
				}

				.code-tab p {
					color: #737373;
					font-size: 0.9375rem;
					margin-bottom: 1rem;
				}

				.cta-section {
					text-align: center;
					padding: 8rem 2rem;
					background: radial-gradient(ellipse 80% 50% at 50% 100%, rgba(120,119,198,0.1), transparent);
				}

				.cta-section h2 {
					font-size: 2.5rem;
					font-weight: 700;
					margin-bottom: 1.5rem;
				}

				.cta-section p {
					color: #737373;
					font-size: 1.125rem;
					margin-bottom: 2rem;
				}

				.footer {
					border-top: 1px solid rgba(255,255,255,0.06);
					padding: 3rem 2rem;
					text-align: center;
					color: #525252;
				}

				.footer a {
					color: #737373;
					text-decoration: none;
				}

				.footer a:hover {
					color: #fafafa;
				}
			`}</style>

			<nav className="nav">
				<div className="nav-inner">
					<span className="nav-logo">Vestig</span>
					<div className="nav-links">
						<Link href="/docs">Docs</Link>
						<Link href="/docs/api">API</Link>
						<a href="https://github.com/Arakiss/vestig" target="_blank" rel="noopener noreferrer">
							GitHub
						</a>
						<Link href="/docs/getting-started" className="nav-cta">
							Get Started
						</Link>
					</div>
				</div>
			</nav>

			<section className="hero">
				<span className="hero-badge">v0.2.0 — Now Available</span>
				<h1>
					<span>Structured Logging</span>
					<br />
					for Every Runtime
				</h1>
				<p className="hero-subtitle">
					A lightweight, zero-dependency logging library with automatic PII sanitization, context
					propagation, and multi-runtime support.
				</p>
				<div className="hero-actions">
					<Link href="/docs/getting-started" className="btn btn-primary">
						Get Started →
					</Link>
					<Link href="/docs" className="btn btn-secondary">
						Read the Docs
					</Link>
				</div>
				<div className="install-cmd">
					<code>bun add vestig</code>
				</div>
			</section>

			<section className="section">
				<div className="section-header">
					<h2>Why Vestig?</h2>
					<p>Leave a trace with production-ready logging</p>
				</div>
				<div className="features-grid">
					{features.map((feature) => (
						<div key={feature.title} className="feature-card">
							<div className="feature-icon">{feature.icon}</div>
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
					))}
				</div>
			</section>

			<section className="section code-examples">
				<div className="section-header">
					<h2>Simple Yet Powerful</h2>
					<p>From quick debugging to production observability</p>
				</div>
				<div className="code-tabs">
					<div className="code-tab">
						<h3>Quick Start</h3>
						<p>Start logging in seconds with sensible defaults</p>
						<CodeBlock code={quickStartCode} filename="app.ts" />
					</div>
					<div className="code-tab">
						<h3>Custom Configuration</h3>
						<p>Fine-tune for your specific needs</p>
						<CodeBlock code={configCode} filename="logger.ts" />
					</div>
					<div className="code-tab">
						<h3>Automatic Sanitization</h3>
						<p>Protect sensitive data without extra code</p>
						<CodeBlock code={sanitizeCode} filename="auth.ts" />
					</div>
					<div className="code-tab">
						<h3>Request Tracing</h3>
						<p>Correlate logs across your entire stack</p>
						<CodeBlock code={contextCode} filename="middleware.ts" />
					</div>
				</div>
			</section>

			<section className="cta-section">
				<h2>Ready to get started?</h2>
				<p>Add structured logging to your project in under a minute</p>
				<Link href="/docs/getting-started" className="btn btn-primary">
					Read the Documentation →
				</Link>
			</section>

			<footer className="footer">
				<p>
					Built with ❤️ •{' '}
					<a href="https://github.com/Arakiss/vestig" target="_blank" rel="noopener noreferrer">
						GitHub
					</a>{' '}
					• MIT License
				</p>
			</footer>
		</div>
	)
}
