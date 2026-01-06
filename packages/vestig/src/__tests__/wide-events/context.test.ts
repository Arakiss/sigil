import { describe, expect, test } from 'bun:test'
import { createWideEvent } from '../../wide-events/builder'
import { getActiveWideEvent, withWideEvent, withWideEventAsync } from '../../wide-events/context'

describe('getActiveWideEvent', () => {
	test('should return undefined when no wide event is set', () => {
		const event = getActiveWideEvent()
		expect(event).toBeUndefined()
	})
})

describe('withWideEvent', () => {
	test('should provide wide event within callback', () => {
		const event = createWideEvent({ type: 'test' })
		let capturedEvent: unknown

		withWideEvent(event, () => {
			capturedEvent = getActiveWideEvent()
		})

		expect(capturedEvent).toBe(event)
	})

	test('should return callback result', () => {
		const event = createWideEvent({ type: 'test' })

		const result = withWideEvent(event, () => {
			return 'result'
		})

		expect(result).toBe('result')
	})

	test('should support nested wide events', () => {
		const outer = createWideEvent({ type: 'outer' })
		const inner = createWideEvent({ type: 'inner' })
		let outerCapture: unknown
		let innerCapture: unknown

		withWideEvent(outer, () => {
			outerCapture = getActiveWideEvent()
			withWideEvent(inner, () => {
				innerCapture = getActiveWideEvent()
			})
		})

		expect(outerCapture).toBe(outer)
		expect(innerCapture).toBe(inner)
	})

	test('should restore previous wide event after callback', () => {
		const outer = createWideEvent({ type: 'outer' })
		const inner = createWideEvent({ type: 'inner' })
		let afterInner: unknown

		withWideEvent(outer, () => {
			withWideEvent(inner, () => {
				// inner scope
			})
			afterInner = getActiveWideEvent()
		})

		expect(afterInner).toBe(outer)
	})

	test('should handle exceptions', () => {
		const event = createWideEvent({ type: 'test' })

		expect(() => {
			withWideEvent(event, () => {
				throw new Error('test error')
			})
		}).toThrow('test error')
	})

	test('should allow enriching event from nested calls', () => {
		const event = createWideEvent({ type: 'http.request' })

		withWideEvent(event, () => {
			const active = getActiveWideEvent()
			active?.set('http', 'method', 'GET')

			// Simulate a nested function call
			nestedFunction()
		})

		expect(event.get('http', 'method')).toBe('GET')
		expect(event.get('user', 'id')).toBe('user-123')

		function nestedFunction() {
			const active = getActiveWideEvent()
			active?.set('user', 'id', 'user-123')
		}
	})
})

describe('withWideEventAsync', () => {
	test('should provide wide event within async callback', async () => {
		const event = createWideEvent({ type: 'test' })
		let capturedEvent: unknown

		await withWideEventAsync(event, async () => {
			await Promise.resolve()
			capturedEvent = getActiveWideEvent()
		})

		expect(capturedEvent).toBe(event)
	})

	test('should return async callback result', async () => {
		const event = createWideEvent({ type: 'test' })

		const result = await withWideEventAsync(event, async () => {
			await Promise.resolve()
			return 'async result'
		})

		expect(result).toBe('async result')
	})

	test('should support nested async wide events', async () => {
		const outer = createWideEvent({ type: 'outer' })
		const inner = createWideEvent({ type: 'inner' })
		let outerCapture: unknown
		let innerCapture: unknown

		await withWideEventAsync(outer, async () => {
			outerCapture = getActiveWideEvent()
			await withWideEventAsync(inner, async () => {
				await Promise.resolve()
				innerCapture = getActiveWideEvent()
			})
		})

		expect(outerCapture).toBe(outer)
		expect(innerCapture).toBe(inner)
	})

	test('should handle async exceptions', async () => {
		const event = createWideEvent({ type: 'test' })

		await expect(
			withWideEventAsync(event, async () => {
				await Promise.resolve()
				throw new Error('async error')
			}),
		).rejects.toThrow('async error')
	})

	test('should work with concurrent async operations', async () => {
		const event1 = createWideEvent({ type: 'request-1' })
		const event2 = createWideEvent({ type: 'request-2' })

		const results: Array<{ id: string; type: string }> = []

		await Promise.all([
			withWideEventAsync(event1, async () => {
				await new Promise((r) => setTimeout(r, 10))
				const active = getActiveWideEvent()
				results.push({ id: '1', type: active?.type ?? 'none' })
			}),
			withWideEventAsync(event2, async () => {
				await new Promise((r) => setTimeout(r, 5))
				const active = getActiveWideEvent()
				results.push({ id: '2', type: active?.type ?? 'none' })
			}),
		])

		const result1 = results.find((r) => r.id === '1')
		const result2 = results.find((r) => r.id === '2')

		expect(result1?.type).toBe('request-1')
		expect(result2?.type).toBe('request-2')
	})

	test('should allow enriching event across async boundaries', async () => {
		const event = createWideEvent({ type: 'http.request' })

		await withWideEventAsync(event, async () => {
			const active = getActiveWideEvent()
			active?.set('http', 'method', 'POST')

			await asyncOperation()
		})

		expect(event.get('http', 'method')).toBe('POST')
		expect(event.get('db', 'query_count')).toBe(3)

		async function asyncOperation() {
			await Promise.resolve()
			const active = getActiveWideEvent()
			active?.set('db', 'query_count', 3)
		}
	})
})
