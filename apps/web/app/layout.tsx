import { LogProvider } from '@/lib/log-context'
import { getRequestContext } from '@vestig/next'
import { VestigProvider } from '@vestig/next/client'
import type { Metadata } from 'next'
import { Hanken_Grotesk, DM_Sans, JetBrains_Mono, Outfit } from 'next/font/google'
import './globals.css'

// Display font for headings
const hankenGrotesk = Hanken_Grotesk({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-display',
	weight: ['400', '500', '600', '700', '800'],
})

// Body font for text
const dmSans = DM_Sans({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sans',
	weight: ['400', '500', '600', '700'],
})

// Logo font (Outfit - reserved ONLY for the logo)
const outfit = Outfit({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-logo',
	weight: ['500', '600', '700'],
})

// Monospace font for code
const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-mono',
})

export const metadata: Metadata = {
	title: 'Vestig — Leave a trace',
	description:
		'A modern, runtime-agnostic structured logging library with automatic PII sanitization and context propagation.',
	icons: {
		icon: '/favicon.svg',
	},
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	// Get correlation context from middleware for client-side correlation
	const ctx = await getRequestContext()

	return (
		<html
			lang="en"
			className={`${hankenGrotesk.variable} ${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
		>
			<head>
				{/* LLM-friendly content discovery */}
				<link rel="llms" href="/llms.txt" />
				<link rel="llms-full" href="/llms-full.txt" />
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				<VestigProvider initialContext={ctx} endpoint="/api/vestig" namespace="client">
					<LogProvider>{children}</LogProvider>
				</VestigProvider>
			</body>
		</html>
	)
}
