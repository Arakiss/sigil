import { Container } from '@/components/layout'

/**
 * Root Loading State
 *
 * Displayed while page content is loading.
 * Uses a minimal skeleton to avoid layout shift.
 */
export default function Loading() {
	return (
		<div className="min-h-screen bg-background">
			<Container size="wide" className="py-16">
				{/* Hero skeleton */}
				<div className="text-center max-w-4xl mx-auto mb-16 animate-pulse">
					{/* Badge skeleton */}
					<div className="h-8 w-32 bg-white/5 rounded-full mx-auto mb-8" />

					{/* Title skeleton */}
					<div className="h-12 md:h-16 bg-white/5 rounded-lg mb-4 max-w-2xl mx-auto" />
					<div className="h-8 md:h-10 bg-white/5 rounded-lg mb-6 max-w-xl mx-auto" />

					{/* Subtitle skeleton */}
					<div className="h-6 bg-white/5 rounded-lg mb-8 max-w-lg mx-auto" />

					{/* CTA skeleton */}
					<div className="flex justify-center gap-4">
						<div className="h-12 w-32 bg-white/5 rounded-full" />
						<div className="h-12 w-32 bg-white/5 rounded-full" />
					</div>
				</div>

				{/* Content skeleton */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="h-48 bg-white/5 rounded-lg animate-pulse"
							style={{ animationDelay: `${i * 100}ms` }}
						/>
					))}
				</div>
			</Container>
		</div>
	)
}
