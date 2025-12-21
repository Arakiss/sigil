import Link from 'next/link'
import { Github, ExternalLink } from 'lucide-react'
import type { FooterContent } from '@/lib/content/types'
import { Container } from '@/components/layout'

interface FooterProps {
	content: FooterContent
}

export function Footer({ content }: FooterProps) {
	return (
		<footer className="border-t border-white/[0.06] bg-surface/50">
			<Container className="py-16">
				{/* Footer links grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
					{content.sections.map((section) => (
						<div key={section.title}>
							<h3 className="text-sm font-semibold text-foreground mb-4">{section.title}</h3>
							<ul className="space-y-3">
								{section.links.map((link) => (
									<li key={link.label}>
										<Link
											href={link.href}
											target={link.external ? '_blank' : undefined}
											rel={link.external ? 'noopener noreferrer' : undefined}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
										>
											{link.label}
											{link.external && <ExternalLink className="h-3 w-3" />}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom section */}
				<div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06]">
					{/* Logo and tagline */}
					<div className="flex items-center gap-4 mb-4 md:mb-0">
						<Link href="/" className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
								<span className="text-sm font-bold text-white">V</span>
							</div>
							<span className="font-semibold text-foreground">Vestig</span>
						</Link>
						<span className="text-sm text-muted-foreground hidden sm:inline">
							{content.tagline}
						</span>
					</div>

					{/* Copyright and GitHub */}
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<span>{content.copyright}</span>
						<Link
							href="https://github.com/vestig-lang/vestig"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
							aria-label="GitHub"
						>
							<Github className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</Container>
		</footer>
	)
}
