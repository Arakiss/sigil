'use client'

import { useLogPanel } from '@/lib/log-context'
import { CompactLogViewer } from './log-viewer'
import { NavArrowDown, NavArrowUp, ListSelect } from 'iconoir-react'
import { cn } from '@/lib/utils'

/**
 * Collapsible log panel that sits at the bottom of the playground
 * Shows log count badge and connection status when collapsed
 */
export function LogPanel() {
	const { isOpen, toggle, logCount, isConnected } = useLogPanel()

	return (
		<div
			className={cn(
				'fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 transition-all duration-300 ease-in-out z-50',
				isOpen ? 'h-80' : 'h-10',
			)}
		>
			{/* Toggle bar */}
			<button
				type="button"
				onClick={toggle}
				className="w-full h-10 flex items-center justify-between px-4 bg-surface hover:bg-surface-elevated transition-colors"
			>
				<div className="flex items-center gap-3">
					{/* Connection indicator */}
					<span className={cn('w-2 h-2', isConnected ? 'bg-white animate-pulse' : 'bg-white/30')} />
					<ListSelect className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm font-medium text-foreground">Log Panel</span>
					{/* Log count badge */}
					{logCount > 0 && (
						<span className="px-2 py-0.5 bg-white/10 text-foreground text-xs font-medium">
							{logCount}
						</span>
					)}
				</div>
				<span className="flex items-center gap-1.5 text-muted-foreground text-sm">
					{isOpen ? (
						<>
							<NavArrowDown className="h-3.5 w-3.5" />
							Collapse
						</>
					) : (
						<>
							<NavArrowUp className="h-3.5 w-3.5" />
							Expand
						</>
					)}
				</span>
			</button>

			{/* Log viewer content */}
			{isOpen && (
				<div className="h-[calc(100%-2.5rem)]">
					<CompactLogViewer />
				</div>
			)}
		</div>
	)
}

/**
 * Floating log toggle button for mobile/compact views
 */
export function LogPanelToggle() {
	const { isOpen, toggle, logCount, isConnected } = useLogPanel()

	return (
		<button
			type="button"
			onClick={toggle}
			className={cn(
				'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 shadow-lg transition-all',
				isOpen ? 'bg-surface text-foreground' : 'bg-white text-black hover:bg-white/90',
			)}
		>
			<span className={cn('w-2 h-2', isConnected ? 'bg-current animate-pulse' : 'bg-current/30')} />
			<span className="text-sm font-medium">Logs</span>
			{logCount > 0 && (
				<span className="px-1.5 py-0.5 bg-black/10 text-xs">
					{logCount > 99 ? '99+' : logCount}
				</span>
			)}
		</button>
	)
}

/**
 * Inline log panel for embedding in page content
 * Not fixed positioned, flows with the content
 */
export function InlineLogPanel({ height = 300 }: { height?: number }) {
	return (
		<div className="bg-black/60 border border-white/10 overflow-hidden" style={{ height }}>
			<CompactLogViewer />
		</div>
	)
}
