import type { LogEntry, Transport, TransportConfig } from 'vestig'
import { type DemoLogEntry, logStore } from './demo-transport'

/**
 * Demo-specific transport that bridges server-side logs to the logStore
 *
 * This transport allows server-side logs (from getLogger in Server Components,
 * Route Handlers, Middleware, etc.) to appear in the Dev Overlay's real-time
 * log viewer by adding them directly to the demo's in-memory logStore.
 *
 * Architecture:
 * - Server logs → DemoLogStoreTransport → logStore → SSE → Dev Overlay
 * - Client logs → VestigProvider → POST /api/vestig → onLog → logStore → SSE → Dev Overlay
 *
 * Note: This is for demo/development purposes only. In production,
 * logs would typically go to external services via HTTP transports.
 */
export class DemoLogStoreTransport implements Transport {
	readonly name = 'demo-log-store'
	readonly config: TransportConfig

	constructor(options: Partial<TransportConfig> = {}) {
		this.config = {
			name: this.name,
			enabled: options.enabled ?? true,
			level: options.level,
			filter: options.filter,
		}
	}

	/**
	 * Add the log entry to the demo's logStore
	 * This makes the log available via the /api/logs SSE stream
	 */
	log(entry: LogEntry): void {
		const demoEntry: DemoLogEntry = {
			...entry,
			id: crypto.randomUUID(),
		}
		logStore.add(demoEntry)
	}
}
