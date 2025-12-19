import type { Metadata } from 'next'
import { LogProvider } from '@/lib/log-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vestig — Leave a trace',
  description:
    'A modern, runtime-agnostic structured logging library with automatic PII sanitization and context propagation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950">
        <LogProvider>
          {children}
        </LogProvider>
      </body>
    </html>
  )
}
