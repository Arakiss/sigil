'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const COPY_TIMEOUT_MS = 2000

interface UseCopyToClipboardOptions {
	/** Duration in ms before copied state resets (default: 2000) */
	timeout?: number
	/** Callback when copy succeeds */
	onSuccess?: () => void
	/** Callback when copy fails */
	onError?: (error: unknown) => void
}

interface UseCopyToClipboardReturn {
	/** Whether text was recently copied */
	copied: boolean
	/** Copy text to clipboard */
	copy: (text: string) => Promise<void>
	/** Reset copied state */
	reset: () => void
}

/**
 * Hook for copying text to clipboard with automatic reset
 *
 * @example
 * const { copied, copy } = useCopyToClipboard()
 *
 * <button onClick={() => copy('npm install vestig')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 */
export function useCopyToClipboard(
	options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
	const { timeout = COPY_TIMEOUT_MS, onSuccess, onError } = options
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Cleanup timeout on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const reset = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		setCopied(false)
	}, [])

	const copy = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text)
				setCopied(true)
				onSuccess?.()

				// Clear any existing timeout before setting a new one
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}
				timeoutRef.current = setTimeout(() => {
					setCopied(false)
					timeoutRef.current = null
				}, timeout)
			} catch (error) {
				// Clipboard API may fail in some contexts (e.g., insecure origins, iframe restrictions)
				console.warn('Failed to copy to clipboard:', error)
				onError?.(error)
			}
		},
		[timeout, onSuccess, onError],
	)

	return { copied, copy, reset }
}

export default useCopyToClipboard
