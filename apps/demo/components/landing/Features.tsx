import Link from 'next/link'
import {
	Package,
	Layers,
	Shield,
	Activity,
	Link as LinkIcon,
	Filter,
	Zap,
	Code,
	Server,
	Terminal,
	type LucideIcon,
} from 'lucide-react'
import type { Feature, FeatureIcon } from '@/lib/content/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container, Section } from '@/components/layout'
import { cn } from '@/lib/utils'

const iconMap: Record<FeatureIcon, LucideIcon> = {
	Package,
	Layers,
	Shield,
	Activity,
	Link: LinkIcon,
	Filter,
	Zap,
	Code,
	Server,
	Terminal,
}

interface FeaturesProps {
	features: Feature[]
	title?: string
	description?: string
}

export function Features({
	features,
	title = 'Everything You Need',
	description = 'A complete logging solution designed for modern TypeScript applications.',
}: FeaturesProps) {
	return (
		<Section id="features" spacing="lg" divider>
			<Container>
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
				</div>

				{/* Features grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => {
						const Icon = iconMap[feature.icon]

						return (
							<Card
								key={feature.id}
								className={cn(
									'card-interactive group',
									'animate-fade-in',
									index > 0 && `animation-delay-${Math.min(index * 100, 500)}`,
								)}
							>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div className="p-2 rounded-lg bg-surface-elevated border border-white/[0.06] group-hover:border-brand-cyan/30 transition-colors">
											<Icon className="h-5 w-5 text-brand-cyan" />
										</div>
										{feature.highlight && (
											<Badge variant="new" className="text-xs">
												{feature.highlight}
											</Badge>
										)}
									</div>
									<CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-sm leading-relaxed">
										{feature.description}
									</CardDescription>
									{feature.link && (
										<Link
											href={feature.link.href}
											className="inline-flex items-center text-sm text-brand-cyan hover:text-brand-cyan/80 mt-4 transition-colors"
										>
											{feature.link.text}
											<svg
												className="ml-1 h-3 w-3"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</Link>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			</Container>
		</Section>
	)
}
