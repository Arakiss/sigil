'use client'

import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the viewport is mobile-sized
 *
 * Returns `undefined` during SSR/initial hydration to prevent hydration mismatch,
 * then resolves to actual value after mount.
 *
 * @example
 * const isMobile = useIsMobile()
 * // During SSR: undefined
 * // After mount on mobile: true
 * // After mount on desktop: false
 */
export function useIsMobile(): boolean | undefined {
	// Use undefined as initial state to prevent hydration mismatch
	// This indicates "not yet determined" vs false meaning "definitely not mobile"
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

	React.useEffect(() => {
		// Only runs on client, so window is available
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

		// Set initial value
		setIsMobile(mql.matches)

		// Use matchMedia listener for better performance than resize
		const onChange = (e: MediaQueryListEvent) => {
			setIsMobile(e.matches)
		}

		mql.addEventListener('change', onChange)
		return () => mql.removeEventListener('change', onChange)
	}, [])

	return isMobile
}
