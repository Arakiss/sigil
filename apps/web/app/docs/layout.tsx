import type { Metadata } from 'next'
import { DocsClientLayout } from './docs-client-layout'

export const metadata: Metadata = {
	title: {
		template: '%s | Vestig Docs',
		default: 'Documentation | Vestig',
	},
	description:
		'Complete documentation for Vestig, the zero-dependency TypeScript logging library with PII sanitization and native tracing.',
	openGraph: {
		type: 'article',
		siteName: 'Vestig',
	},
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return <DocsClientLayout>{children}</DocsClientLayout>
}
