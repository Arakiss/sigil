import { getLogger as getVestigLogger } from '@vestig/next'
import type { Logger } from 'vestig'
import { DemoLogStoreTransport } from './demo-log-store-transport'

// Track if we've added the transport to avoid duplicates
const enhancedLoggers = new WeakSet<Logger>()

/**
 * Get a logger that sends logs to both console AND the Demo's logStore
 *
 * This wraps @vestig/next's getLogger and adds the DemoLogStoreTransport,
 * allowing server-side logs to appear in the Dev Overlay.
 *
 * Usage (in Server Components, Route Handlers, etc.):
 * ```typescript
 * import { getDemoLogger } from '@/lib/demo-logger'
 *
 * export default async function MyPage() {
 *   const log = await getDemoLogger('my-page')
 *   log.info('Page rendered') // Shows in both console AND Dev Overlay
 * }
 * ```
 *
 * @param namespace - Optional namespace for the logger
 * @returns Logger instance with DemoLogStoreTransport added
 */
export async function getDemoLogger(namespace?: string): Promise<Logger> {
	const logger = await getVestigLogger(namespace)

	// Add transport if not already added (avoid duplicates)
	if (!enhancedLoggers.has(logger)) {
		logger.addTransport(new DemoLogStoreTransport())
		enhancedLoggers.add(logger)
	}

	return logger
}
