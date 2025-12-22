import { getLandingContent } from '@/lib/content'
import {
	StickyNav,
	Hero,
	InteractiveFeatures,
	InteractiveExamples,
	Comparison,
	FinalCTA,
	Footer,
} from '@/components/landing'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export const dynamic = 'force-static'

/**
 * Landing Page - Cloudflare Sandbox Inspired Design
 *
 * New section order:
 * 1. StickyNav - Fixed navigation with install command
 * 2. Hero - Massive title with LineTitle effect
 * 3. InteractiveFeatures - Feature cards with visualizations
 * 4. InteractiveExamples - Tab-based code examples
 * 5. Comparison - Redesigned comparison table
 * 6. FinalCTA - Call to action with install command
 * 7. Footer - Updated with blueprint styling
 */
export default function LandingPage() {
	const content = getLandingContent()

	return (
		<>
			<StickyNav />
			<main>
				<Hero content={content.hero} />
				<InteractiveFeatures />
				<InteractiveExamples />
				<Comparison config={content.comparison} />
				<FinalCTA />
			</main>
			<Footer content={content.footer} />
			<ScrollToTop />
		</>
	)
}
