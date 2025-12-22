/**
 * Generate a random hex string of specified length
 */
function randomHex(length: number): string {
	const bytes = new Uint8Array(length / 2)
	crypto.getRandomValues(bytes)
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

/**
 * Generate a trace ID (32 hex characters / 128 bits)
 */
export function generateTraceId(): string {
	return randomHex(32)
}

/**
 * Generate a span ID (16 hex characters / 64 bits)
 */
export function generateSpanId(): string {
	return randomHex(16)
}

/**
 * Generate a request ID (UUID v4 format)
 */
export function generateRequestId(): string {
	return crypto.randomUUID()
}

/**
 * Parse W3C Trace Context traceparent header
 * Format: {version}-{trace-id}-{parent-id}-{trace-flags}
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
export function parseTraceparent(header: string): {
	traceId: string
	spanId: string
} | null {
	const parts = header.split('-')
	if (parts.length !== 4) return null
	const [version, traceId, spanId] = parts
	if (version !== '00') return null
	if (!traceId || traceId.length !== 32) return null
	if (!spanId || spanId.length !== 16) return null
	return { traceId, spanId }
}

/**
 * Create W3C Trace Context traceparent header
 */
export function createTraceparent(traceId: string, spanId: string): string {
	return `00-${traceId}-${spanId}-01`
}

/**
 * W3C Trace Context tracestate entry
 */
export interface TracestateEntry {
	/** Vendor/tenant key (e.g., 'vestig', 'datadog') */
	key: string
	/** Value associated with the key */
	value: string
}

/**
 * Parse W3C Trace Context tracestate header
 *
 * Format: key1=value1,key2=value2,key3=value3
 * Example: vestig=abc123,dd=server:xyz
 *
 * Per the W3C spec:
 * - Keys may be simple (e.g., "vestig") or multi-tenant (e.g., "vendor@tenant")
 * - Values must not contain ',' or '='
 * - Maximum 32 list members
 *
 * @param header - The tracestate header value
 * @returns Array of parsed entries, or empty array if invalid
 */
export function parseTracestate(header: string): TracestateEntry[] {
	if (!header || typeof header !== 'string') {
		return []
	}

	const entries: TracestateEntry[] = []
	const parts = header.split(',')

	// W3C spec allows maximum 32 list members
	const maxEntries = 32
	let count = 0

	for (const part of parts) {
		if (count >= maxEntries) break

		const trimmed = part.trim()
		if (!trimmed) continue

		const eqIndex = trimmed.indexOf('=')
		if (eqIndex === -1) continue

		const key = trimmed.slice(0, eqIndex).trim()
		const value = trimmed.slice(eqIndex + 1).trim()

		// Validate key format (simple key or vendor@tenant format)
		if (!isValidTracestateKey(key)) continue

		// Validate value (no commas or equals signs)
		if (!isValidTracestateValue(value)) continue

		entries.push({ key, value })
		count++
	}

	return entries
}

/**
 * Validate tracestate key format
 * Keys must be: a-z, 0-9, _, -, *, / and optionally @ for multi-tenant
 */
function isValidTracestateKey(key: string): boolean {
	if (!key || key.length > 256) return false
	// Simple key: lowercase letters, digits, underscore, hyphen, asterisk, forward slash
	// Multi-tenant key: vendor@tenant
	const keyRegex = /^[a-z][a-z0-9_\-*\/]*(@[a-z][a-z0-9_\-*\/]*)?$/
	return keyRegex.test(key)
}

/**
 * Validate tracestate value format
 * Values must not contain comma, equals, or control characters
 */
function isValidTracestateValue(value: string): boolean {
	if (!value || value.length > 256) return false
	// No comma, equals, or control characters (0x00-0x1F, 0x7F)
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i)
		if (code < 0x20 || code === 0x2c || code === 0x3d || code === 0x7f) {
			return false
		}
	}
	return true
}

/**
 * Create W3C Trace Context tracestate header from entries
 *
 * @param entries - Array of key-value entries
 * @returns Formatted tracestate header value
 */
export function createTracestate(entries: TracestateEntry[]): string {
	if (!entries || entries.length === 0) {
		return ''
	}

	// Limit to 32 entries per W3C spec
	const limitedEntries = entries.slice(0, 32)

	return limitedEntries
		.filter((e) => isValidTracestateKey(e.key) && isValidTracestateValue(e.value))
		.map((e) => `${e.key}=${e.value}`)
		.join(',')
}

/**
 * Get a value from a tracestate by key
 *
 * @param entries - Parsed tracestate entries
 * @param key - Key to look up
 * @returns Value if found, undefined otherwise
 */
export function getTracestateValue(entries: TracestateEntry[], key: string): string | undefined {
	const entry = entries.find((e) => e.key === key)
	return entry?.value
}

/**
 * Set or update a value in tracestate entries
 * New entries are prepended (most recently updated first)
 *
 * @param entries - Existing tracestate entries
 * @param key - Key to set
 * @param value - Value to set
 * @returns New array of entries with the updated value
 */
export function setTracestateValue(
	entries: TracestateEntry[],
	key: string,
	value: string,
): TracestateEntry[] {
	// Remove existing entry with same key
	const filtered = entries.filter((e) => e.key !== key)

	// Prepend new entry (W3C spec: most recently updated first)
	return [{ key, value }, ...filtered].slice(0, 32)
}

/**
 * Delete a key from tracestate entries
 *
 * @param entries - Existing tracestate entries
 * @param key - Key to delete
 * @returns New array of entries without the key
 */
export function deleteTracestateKey(entries: TracestateEntry[], key: string): TracestateEntry[] {
	return entries.filter((e) => e.key !== key)
}
