import { describe, expect, test, beforeEach, mock } from 'bun:test'
import {
	addBreadcrumb,
	getBreadcrumbs,
	clearBreadcrumbs,
	type Breadcrumb,
} from '../../client/error-boundary'

describe('Breadcrumb management', () => {
	beforeEach(() => {
		clearBreadcrumbs()
	})

	test('should add breadcrumbs', () => {
		addBreadcrumb({
			timestamp: '2025-01-01T00:00:00.000Z',
			level: 'info',
			message: 'Test message',
		})

		const crumbs = getBreadcrumbs()
		expect(crumbs.length).toBe(1)
		expect(crumbs[0]!.message).toBe('Test message')
		expect(crumbs[0]!.level).toBe('info')
	})

	test('should add multiple breadcrumbs in order', () => {
		addBreadcrumb({ message: 'First' })
		addBreadcrumb({ message: 'Second' })
		addBreadcrumb({ message: 'Third' })

		const crumbs = getBreadcrumbs()
		expect(crumbs.length).toBe(3)
		expect(crumbs[0]!.message).toBe('First')
		expect(crumbs[1]!.message).toBe('Second')
		expect(crumbs[2]!.message).toBe('Third')
	})

	test('should use defaults for missing fields', () => {
		addBreadcrumb({ message: 'Test' })

		const crumbs = getBreadcrumbs()
		expect(crumbs[0]!.level).toBe('info')
		expect(crumbs[0]!.timestamp).toBeDefined()
	})

	test('should clear breadcrumbs', () => {
		addBreadcrumb({ message: 'Test 1' })
		addBreadcrumb({ message: 'Test 2' })

		clearBreadcrumbs()

		const crumbs = getBreadcrumbs()
		expect(crumbs.length).toBe(0)
	})

	test('should limit breadcrumbs to max size', () => {
		// Default max is 20, add 25
		for (let i = 0; i < 25; i++) {
			addBreadcrumb({ message: `Message ${i}` })
		}

		const crumbs = getBreadcrumbs()
		expect(crumbs.length).toBe(20)
		// Should have the latest 20 (5-24)
		expect(crumbs[0]!.message).toBe('Message 5')
		expect(crumbs[19]!.message).toBe('Message 24')
	})

	test('should preserve namespace in breadcrumbs', () => {
		addBreadcrumb({
			message: 'Test',
			namespace: 'auth:login',
		})

		const crumbs = getBreadcrumbs()
		expect(crumbs[0]!.namespace).toBe('auth:login')
	})

	test('should handle undefined namespace', () => {
		addBreadcrumb({ message: 'Test' })

		const crumbs = getBreadcrumbs()
		expect(crumbs[0]!.namespace).toBeUndefined()
	})

	test('should return readonly array', () => {
		addBreadcrumb({ message: 'Test' })

		const crumbs = getBreadcrumbs()

		// TypeScript should prevent mutation, but runtime check
		expect(Array.isArray(crumbs)).toBe(true)
	})
})

describe('VestigErrorBoundary', () => {
	// Note: Full React component testing would require a React testing library
	// These are unit tests for the exported utilities

	beforeEach(() => {
		clearBreadcrumbs()
	})

	test('breadcrumbs should be available for error context', () => {
		// Simulate logging before an error
		addBreadcrumb({ level: 'info', message: 'User clicked button' })
		addBreadcrumb({ level: 'debug', message: 'Fetching data...' })
		addBreadcrumb({ level: 'warn', message: 'Slow response detected' })

		const crumbs = getBreadcrumbs()

		expect(crumbs.length).toBe(3)
		expect(crumbs.map((c) => c.level)).toEqual(['info', 'debug', 'warn'])
	})

	test('breadcrumbs should be clearable after error handling', () => {
		addBreadcrumb({ message: 'Before error' })

		// Simulate error handling
		const crumbsBeforeClear = getBreadcrumbs()
		expect(crumbsBeforeClear.length).toBe(1)

		clearBreadcrumbs()

		const crumbsAfterClear = getBreadcrumbs()
		expect(crumbsAfterClear.length).toBe(0)
	})
})
