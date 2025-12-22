import { LogPanel } from '@/app/components/log-panel'
import {
	HomeSimple,
	Server,
	Laptop,
	PlugTypeA,
	Flash,
	MediaVideo,
	Lock,
	Antenna,
} from 'iconoir-react'
import { InnerNav, Sidebar, type SidebarSection } from '@/components/layout'

const navigation: SidebarSection[] = [
	{
		title: 'Demos',
		items: [
			{ title: 'Overview', href: '/playground', icon: <HomeSimple className="h-4 w-4" /> },
			{
				title: 'Server Components',
				href: '/playground/server',
				icon: <Server className="h-4 w-4" />,
			},
			{
				title: 'Client Components',
				href: '/playground/client',
				icon: <Laptop className="h-4 w-4" />,
			},
			{
				title: 'API Routes',
				href: '/playground/api-routes',
				icon: <PlugTypeA className="h-4 w-4" />,
			},
			{ title: 'Edge Runtime', href: '/playground/edge', icon: <Flash className="h-4 w-4" /> },
			{
				title: 'Server Actions',
				href: '/playground/actions',
				icon: <MediaVideo className="h-4 w-4" />,
			},
		],
	},
	{
		title: 'Advanced',
		items: [
			{
				title: 'PII Sanitization',
				href: '/playground/sanitization',
				icon: <Lock className="h-4 w-4" />,
			},
			{
				title: 'Transports',
				href: '/playground/transports',
				icon: <Antenna className="h-4 w-4" />,
			},
		],
	},
]

export default function PlaygroundLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="min-h-screen bg-background">
			<InnerNav section="Playground" />
			<Sidebar sections={navigation} />

			{/* Main content */}
			<main className="lg:pl-64 pt-14 pb-48">
				<div className="p-6">{children}</div>
			</main>

			{/* Log panel at bottom */}
			<LogPanel />
		</div>
	)
}
