import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground shadow',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
				outline: 'border-white/10 text-foreground',
				// Custom variants for Vestig
				new: 'border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan',
				runtime: 'border-white/10 bg-white/5 text-muted-foreground',
				level: {
					trace: 'border-level-trace/20 bg-level-trace/10 text-level-trace',
					debug: 'border-level-debug/20 bg-level-debug/10 text-level-debug',
					info: 'border-level-info/20 bg-level-info/10 text-level-info',
					warn: 'border-level-warn/20 bg-level-warn/10 text-level-warn',
					error: 'border-level-error/20 bg-level-error/10 text-level-error',
				},
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
