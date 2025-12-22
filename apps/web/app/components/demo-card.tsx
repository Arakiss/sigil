'use client'

import { type ReactNode, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'iconoir-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface DemoCardProps {
	/** Card title */
	title: string
	/** Card description */
	description: string
	/** Icon to display */
	icon?: ReactNode
	/** Code example to show */
	code?: string
	/** Action button label */
	actionLabel?: string
	/** Action handler */
	onAction?: () => void | Promise<void>
	/** Whether action is running */
	isLoading?: boolean
	/** Child content to render */
	children?: ReactNode
	/** Additional CSS classes */
	className?: string
}

/**
 * Reusable demo card component
 * Displays a demo with title, description, code example, and action button
 */
export function DemoCard({
	title,
	description,
	icon,
	code,
	actionLabel = 'Run Demo',
	onAction,
	isLoading = false,
	children,
	className = '',
}: DemoCardProps) {
	const [localLoading, setLocalLoading] = useState(false)
	const loading = isLoading || localLoading

	const handleAction = async () => {
		if (!onAction || loading) return
		setLocalLoading(true)
		try {
			await onAction()
		} finally {
			setLocalLoading(false)
		}
	}

	return (
		<Card className={cn('bg-surface hover:bg-surface-elevated transition-colors', className)}>
			<CardHeader className="pb-3">
				<div className="flex items-start gap-3">
					{icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
					<div className="flex-1 space-y-1">
						<CardTitle className="text-base">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Code example */}
				{code && (
					<div className="bg-black/40 border border-white/10 p-4 overflow-x-auto">
						<pre className="text-xs">
							<code className="text-muted-foreground font-mono">{code}</code>
						</pre>
					</div>
				)}

				{/* Custom content */}
				{children}

				{/* Action button */}
				{onAction && (
					<Button onClick={handleAction} disabled={loading} className="w-full">
						{loading ? (
							<>
								<Spinner className="h-4 w-4" />
								Running...
							</>
						) : (
							<>
								<Play className="h-4 w-4" />
								{actionLabel}
							</>
						)}
					</Button>
				)}
			</CardContent>
		</Card>
	)
}

/**
 * Grid layout for demo cards
 */
export function DemoGrid({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
			{children}
		</div>
	)
}

/**
 * Link card for navigation
 */
export function DemoLinkCard({
	title,
	description,
	icon,
	href,
	tags,
	className = '',
}: {
	title: string
	description: string
	icon: ReactNode
	href: string
	tags?: string[]
	className?: string
}) {
	return (
		<Link href={href} className={cn('block group', className)}>
			<Card className="h-full bg-surface hover:bg-surface-elevated hover:border-white/20 transition-all">
				<CardHeader className="pb-3">
					<div className="flex items-start gap-3">
						<span className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
							{icon}
						</span>
						<div className="flex-1 space-y-1">
							<CardTitle className="text-base group-hover:text-foreground transition-colors flex items-center gap-2">
								{title}
								<ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
							</CardTitle>
							<CardDescription>{description}</CardDescription>
						</div>
					</div>
				</CardHeader>
				{tags && tags.length > 0 && (
					<CardContent className="pt-0">
						<div className="flex flex-wrap gap-1.5">
							{tags.map((tag) => (
								<Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
									{tag}
								</Badge>
							))}
						</div>
					</CardContent>
				)}
			</Card>
		</Link>
	)
}

/**
 * Result display area
 */
export function DemoResult({
	title = 'Result',
	children,
	className = '',
}: {
	title?: string
	children: ReactNode
	className?: string
}) {
	return (
		<div className={cn('mt-4', className)}>
			<div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
				{title}
			</div>
			<div className="bg-black/30 p-4 border border-white/5">{children}</div>
		</div>
	)
}
