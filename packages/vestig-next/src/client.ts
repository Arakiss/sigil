'use client'

/**
 * @vestig/next/client - Client-side logging for Next.js
 *
 * @example
 * ```typescript
 * // app/layout.tsx
 * import { VestigProvider } from '@vestig/next/client'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <VestigProvider>{children}</VestigProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 *
 * @example
 * ```typescript
 * // components/MyComponent.tsx
 * 'use client'
 *
 * import { useLogger } from '@vestig/next/client'
 *
 * export function MyComponent() {
 *   const log = useLogger('my-component')
 *
 *   const handleClick = () => {
 *     log.info('Button clicked')
 *   }
 *
 *   return <button onClick={handleClick}>Click me</button>
 * }
 * ```
 *
 * @packageDocumentation
 */

// Provider
export { VestigProvider, useVestigContext, type VestigProviderProps } from './client/provider'

// Hooks
export {
	useLogger,
	useCorrelationContext,
	useVestigConnection,
	useComponentLogger,
	useRenderLogger,
} from './client/hooks'

// Transport (for advanced use cases)
export {
	ClientHTTPTransport,
	createClientTransport,
	type ClientHTTPTransportConfig,
} from './client/transport'
