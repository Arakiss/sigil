import { Container } from '@/components/layout'

/**
 * Playground Loading State
 *
 * Displayed while playground pages are loading.
 */
export default function PlaygroundLoading() {
	return (
		<Container size="wide" className="py-8">
			<div className="animate-pulse">
				{/* Header skeleton */}
				<div className="mb-8">
					<div className="flex items-center gap-2 mb-4">
						<div className="h-6 w-20 bg-white/5 rounded-full" />
						<div className="h-6 w-24 bg-white/5 rounded-full" />
					</div>
					<div className="h-10 w-64 bg-white/5 rounded-lg mb-4" />
					<div className="h-5 w-96 bg-white/5 rounded-lg" />
				</div>

				{/* Content skeleton */}
				<div className="grid gap-6">
					<div className="h-64 bg-white/5 rounded-lg" />
					<div className="grid md:grid-cols-2 gap-4">
						<div className="h-48 bg-white/5 rounded-lg" />
						<div className="h-48 bg-white/5 rounded-lg" />
					</div>
				</div>
			</div>
		</Container>
	)
}
