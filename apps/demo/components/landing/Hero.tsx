'use client'

import Link from 'next/link'
import { ArrowRight, Copy, Check, Terminal } from 'lucide-react'
import { useState } from 'react'
import type { HeroContent } from '@/lib/content/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout'
import { cn } from '@/lib/utils'

interface HeroProps {
	content: HeroContent
}

export function Hero({ content }: HeroProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await navigator.clipboard.writeText(content.installCommand)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
			{/* Background glow effect */}
			<div className="absolute inset-0 bg-hero-glow pointer-events-none" />

			<Container size="default" className="relative">
				<div className="text-center">
					{/* Badge */}
					{content.badge && (
						<div className="mb-6 inline-flex animate-fade-in">
							<Link href={content.badge.href || '#'}>
								<Badge
									variant={content.badge.variant === 'new' ? 'new' : 'outline'}
									className="px-3 py-1 text-sm hover:bg-brand-cyan/20 transition-colors"
								>
									{content.badge.text}
									<ArrowRight className="ml-1 h-3 w-3" />
								</Badge>
							</Link>
						</div>
					)}

					{/* Headline */}
					<h1 className="animate-fade-in animation-delay-100">
						<span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
							{content.headline.primary}
						</span>
						<span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-brand mt-2">
							{content.headline.secondary}
						</span>
					</h1>

					{/* Subheadline */}
					<p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-fade-in animation-delay-200">
						{content.subheadline}
					</p>

					{/* CTAs */}
					<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-300">
						<Button asChild size="lg" variant={content.ctas.primary.variant || 'glow'}>
							<Link href={content.ctas.primary.href}>
								{content.ctas.primary.text}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						{content.ctas.secondary && (
							<Button asChild size="lg" variant={content.ctas.secondary.variant || 'outline'}>
								<Link href={content.ctas.secondary.href}>{content.ctas.secondary.text}</Link>
							</Button>
						)}
					</div>

					{/* Install command */}
					<div className="mt-8 animate-fade-in animation-delay-500">
						<div className="inline-flex items-center gap-3 bg-surface rounded-lg border border-white/[0.06] px-4 py-2.5 text-sm">
							<Terminal className="h-4 w-4 text-muted-foreground" />
							<code className="font-mono text-foreground">{content.installCommand}</code>
							<button
								onClick={handleCopy}
								className="text-muted-foreground hover:text-foreground transition-colors"
								aria-label="Copy install command"
							>
								{copied ? (
									<Check className="h-4 w-4 text-brand-cyan" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{/* Code preview */}
					{content.codePreview && (
						<div className="mt-16 animate-fade-in animation-delay-700">
							<div className="relative max-w-2xl mx-auto">
								<div className="absolute -inset-1 bg-gradient-brand opacity-20 blur-xl rounded-xl" />
								<div className="relative bg-surface rounded-xl border border-white/[0.06] overflow-hidden">
									{/* Window chrome */}
									<div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
										<div className="flex gap-1.5">
											<div className="w-3 h-3 rounded-full bg-red-500/50" />
											<div className="w-3 h-3 rounded-full bg-yellow-500/50" />
											<div className="w-3 h-3 rounded-full bg-green-500/50" />
										</div>
										<span className="text-xs text-muted-foreground ml-2 font-mono">example.ts</span>
									</div>
									{/* Code content */}
									<pre className="p-4 text-left text-sm overflow-x-auto border-0 bg-transparent">
										<code>
											{content.codePreview.lines.map((line, i) => (
												<div
													key={i}
													className={cn('font-mono', line.highlight && 'text-brand-cyan')}
												>
													{line.content || '\u00A0'}
												</div>
											))}
										</code>
									</pre>
								</div>
							</div>
						</div>
					)}
				</div>
			</Container>
		</section>
	)
}
