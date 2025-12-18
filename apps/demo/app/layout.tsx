import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Sigil — Leave your mark',
	description: 'A modern, runtime-agnostic structured logging library with automatic PII sanitization and context propagation.',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}
