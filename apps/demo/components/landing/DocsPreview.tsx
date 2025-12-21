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
	ArrowRight,
	type LucideIcon,
} from 'lucide-react'
import type { DocsPreviewSection, FeatureIcon } from '@/lib/content/types'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Container, Section } from '@/components/layout'

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

interface DocsPreviewProps {
	sections: DocsPreviewSection[]
	title?: string
	description?: string
}

export function DocsPreview({
	sections,
	title = 'Dive Into the Docs',
	description = 'Comprehensive documentation to get you started quickly.',
}: DocsPreviewProps) {
	return (
		<Section id="docs-preview" spacing="lg" divider>
			<Container>
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h2>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
				</div>

				{/* Docs grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
					{sections.map((section) => {
						const Icon = iconMap[section.icon]

						return (
							<Link key={section.id} href={section.href} className="group">
								<Card className="card-interactive h-full">
									<CardHeader>
										<div className="flex items-center gap-4">
											<div className="p-2.5 rounded-lg bg-surface-elevated border border-white/[0.06] group-hover:border-brand-cyan/30 transition-colors">
												<Icon className="h-5 w-5 text-brand-cyan" />
											</div>
											<div className="flex-1">
												<CardTitle className="text-base flex items-center gap-2">
													{section.title}
													<ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
												</CardTitle>
												<CardDescription className="text-sm mt-1">
													{section.description}
												</CardDescription>
											</div>
										</div>
									</CardHeader>
								</Card>
							</Link>
						)
					})}
				</div>

				{/* View all docs link */}
				<div className="text-center mt-12">
					<Link
						href="/docs"
						className="inline-flex items-center text-brand-cyan hover:text-brand-cyan/80 transition-colors"
					>
						View all documentation
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</div>
			</Container>
		</Section>
	)
}
