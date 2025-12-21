import { Check, X, Minus } from 'lucide-react'
import type { ComparisonConfig } from '@/lib/content/types'
import { Container, Section } from '@/components/layout'
import { cn } from '@/lib/utils'

interface ComparisonProps {
	config: ComparisonConfig
}

function CellValue({ value }: { value: string | boolean }) {
	if (typeof value === 'boolean') {
		return value ? (
			<Check className="h-5 w-5 text-brand-cyan mx-auto" />
		) : (
			<X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
		)
	}

	if (value === 'Partial' || value === 'Plugin') {
		return (
			<span className="inline-flex items-center gap-1 text-muted-foreground">
				<Minus className="h-4 w-4" />
				<span className="text-sm">{value}</span>
			</span>
		)
	}

	return <span className="text-sm">{value}</span>
}

export function Comparison({ config }: ComparisonProps) {
	const libraries = ['vestig', 'pino', 'winston', 'bunyan'] as const

	return (
		<Section id="comparison" spacing="lg" divider>
			<Container>
				{/* Section header */}
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground">{config.title}</h2>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
						{config.description}
					</p>
				</div>

				{/* Comparison table */}
				<div className="overflow-x-auto">
					<div className="inline-block min-w-full align-middle">
						<div className="overflow-hidden rounded-xl border border-white/[0.06]">
							<table className="min-w-full">
								<thead className="bg-surface-elevated">
									<tr>
										<th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
											Feature
										</th>
										{libraries.map((lib) => (
											<th
												key={lib}
												className={cn(
													'px-6 py-4 text-center text-sm font-semibold',
													lib === 'vestig' ? 'text-brand-cyan bg-brand-cyan/5' : 'text-foreground',
												)}
											>
												{lib.charAt(0).toUpperCase() + lib.slice(1)}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-white/[0.06]">
									{config.rows.map((row, index) => (
										<tr
											key={row.feature}
											className={cn(
												'transition-colors hover:bg-surface-elevated/50',
												index % 2 === 0 ? 'bg-surface' : 'bg-surface/50',
											)}
										>
											<td className="px-6 py-4 text-sm font-medium text-foreground whitespace-nowrap">
												{row.feature}
											</td>
											{libraries.map((lib) => {
												const value = row[lib]
												return (
													<td
														key={lib}
														className={cn(
															'px-6 py-4 text-center',
															lib === 'vestig' && 'bg-brand-cyan/5',
														)}
													>
														{value !== undefined ? (
															<CellValue value={value} />
														) : (
															<Minus className="h-4 w-4 text-muted-foreground/30 mx-auto" />
														)}
													</td>
												)
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Footnote */}
				{config.footnote && (
					<p className="mt-6 text-sm text-muted-foreground text-center">{config.footnote}</p>
				)}
			</Container>
		</Section>
	)
}
