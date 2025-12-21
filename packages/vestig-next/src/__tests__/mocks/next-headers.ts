/**
 * Mock implementations for next/headers
 * Used for testing server components and server actions
 */

// Store for the current mock headers
let mockHeadersStore: Map<string, string> = new Map()
let mockCookiesStore: Map<string, string> = new Map()

/**
 * Set mock headers for the current test
 */
export function setMockHeaders(headers: Record<string, string>) {
	mockHeadersStore = new Map(Object.entries(headers))
}

/**
 * Clear mock headers
 */
export function clearMockHeaders() {
	mockHeadersStore = new Map()
}

/**
 * Set mock cookies for the current test
 */
export function setMockCookies(cookies: Record<string, string>) {
	mockCookiesStore = new Map(Object.entries(cookies))
}

/**
 * Clear mock cookies
 */
export function clearMockCookies() {
	mockCookiesStore = new Map()
}

/**
 * Mock headers() function
 * Returns a ReadonlyHeaders-like object
 */
export async function headers(): Promise<MockReadonlyHeaders> {
	return {
		get: (name: string) => mockHeadersStore.get(name.toLowerCase()) ?? null,
		has: (name: string) => mockHeadersStore.has(name.toLowerCase()),
		entries: () => mockHeadersStore.entries(),
		keys: () => mockHeadersStore.keys(),
		values: () => mockHeadersStore.values(),
		forEach: (callback: (value: string, key: string) => void) => {
			mockHeadersStore.forEach(callback)
		},
		[Symbol.iterator]: () => mockHeadersStore.entries(),
	}
}

/**
 * Mock cookies() function
 */
export async function cookies(): Promise<MockReadonlyCookies> {
	return {
		get: (name: string) => {
			const value = mockCookiesStore.get(name)
			return value ? { name, value } : undefined
		},
		getAll: () => {
			return Array.from(mockCookiesStore.entries()).map(([name, value]) => ({
				name,
				value,
			}))
		},
		has: (name: string) => mockCookiesStore.has(name),
		[Symbol.iterator]: function* () {
			for (const [name, value] of mockCookiesStore.entries()) {
				yield { name, value }
			}
		},
	}
}

/**
 * Mock ReadonlyHeaders type
 */
export interface MockReadonlyHeaders {
	get: (name: string) => string | null
	has: (name: string) => boolean
	entries: () => IterableIterator<[string, string]>
	keys: () => IterableIterator<string>
	values: () => IterableIterator<string>
	forEach: (callback: (value: string, key: string) => void) => void
	[Symbol.iterator]: () => IterableIterator<[string, string]>
}

/**
 * Mock ReadonlyCookies type
 */
export interface MockReadonlyCookies {
	get: (name: string) => { name: string; value: string } | undefined
	getAll: () => Array<{ name: string; value: string }>
	has: (name: string) => boolean
	[Symbol.iterator]: () => Generator<{ name: string; value: string }>
}
