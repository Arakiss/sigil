import type { Metadata } from 'next'
import { BlogClientLayout } from './blog-client-layout'

export const metadata: Metadata = {
	title: {
		template: '%s | Vestig Blog',
		default: 'Blog | Vestig',
	},
	description:
		'Updates, tutorials, and insights about Vestig - the zero-dependency TypeScript logging library.',
	openGraph: {
		type: 'article',
		siteName: 'Vestig',
	},
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return <BlogClientLayout>{children}</BlogClientLayout>
}
