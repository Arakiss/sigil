import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { createRequestTiming, formatDuration } from '../../utils/timing'

describe('createRequestTiming', () => {
	test('should create timing with start time', () => {
		const timing = createRequestTiming()

		expect(timing.start).toBeGreaterThan(0)
		expect(typeof timing.start).toBe('number')
	})

	test('elapsed() should return time since start', async () => {
		const timing = createRequestTiming()

		// Wait a small amount
		await new Promise((r) => setTimeout(r, 10))

		const elapsed = timing.elapsed()
		expect(elapsed).toBeGreaterThan(0)
		expect(elapsed).toBeLessThan(1000) // Should be less than 1 second
	})

	test('elapsed() should increase over time', async () => {
		const timing = createRequestTiming()

		const elapsed1 = timing.elapsed()
		await new Promise((r) => setTimeout(r, 5))
		const elapsed2 = timing.elapsed()

		expect(elapsed2).toBeGreaterThan(elapsed1)
	})

	test('mark() should record checkpoint', () => {
		const timing = createRequestTiming()

		timing.mark('checkpoint1')

		expect(timing.getMark('checkpoint1')).toBeDefined()
		expect(typeof timing.getMark('checkpoint1')).toBe('number')
	})

	test('mark() should record elapsed time from start', async () => {
		const timing = createRequestTiming()

		await new Promise((r) => setTimeout(r, 10))
		timing.mark('after-delay')

		const markTime = timing.getMark('after-delay')
		expect(markTime).toBeGreaterThan(0)
	})

	test('getMark() should return undefined for non-existent mark', () => {
		const timing = createRequestTiming()

		expect(timing.getMark('non-existent')).toBeUndefined()
	})

	test('getMarks() should return all marks', () => {
		const timing = createRequestTiming()

		timing.mark('mark1')
		timing.mark('mark2')
		timing.mark('mark3')

		const marks = timing.getMarks()

		expect(marks.mark1).toBeDefined()
		expect(marks.mark2).toBeDefined()
		expect(marks.mark3).toBeDefined()
		expect(Object.keys(marks)).toHaveLength(3)
	})

	test('getMarks() should return a copy, not the original', () => {
		const timing = createRequestTiming()

		timing.mark('original')
		const marks = timing.getMarks()

		marks.added = 999

		expect(timing.getMark('added')).toBeUndefined()
	})

	test('complete() should set end time', () => {
		const timing = createRequestTiming()

		expect(timing.end).toBeUndefined()

		timing.complete()

		expect(timing.end).toBeDefined()
		expect(typeof timing.end).toBe('number')
	})

	test('complete() should return total duration', async () => {
		const timing = createRequestTiming()

		await new Promise((r) => setTimeout(r, 10))
		const duration = timing.complete()

		expect(duration).toBeGreaterThan(0)
		expect(duration).toBeLessThan(1000)
	})

	test('elapsed() after complete() should use end time', async () => {
		const timing = createRequestTiming()

		await new Promise((r) => setTimeout(r, 10))
		timing.complete()

		const elapsed1 = timing.elapsed()
		await new Promise((r) => setTimeout(r, 10))
		const elapsed2 = timing.elapsed()

		// After complete(), elapsed should not change
		expect(elapsed1).toBe(elapsed2)
	})

	test('multiple marks should have increasing times', async () => {
		const timing = createRequestTiming()

		timing.mark('first')
		await new Promise((r) => setTimeout(r, 5))
		timing.mark('second')
		await new Promise((r) => setTimeout(r, 5))
		timing.mark('third')

		const marks = timing.getMarks()
		expect(marks.second).toBeGreaterThan(marks.first)
		expect(marks.third).toBeGreaterThan(marks.second)
	})
})

describe('formatDuration', () => {
	test('should format microseconds (< 1ms)', () => {
		expect(formatDuration(0.5)).toBe('500μs')
		expect(formatDuration(0.001)).toBe('1μs')
		expect(formatDuration(0.999)).toBe('999μs')
	})

	test('should format milliseconds (1-999ms)', () => {
		expect(formatDuration(1)).toBe('1.00ms')
		expect(formatDuration(50.5)).toBe('50.50ms')
		expect(formatDuration(999)).toBe('999.00ms')
		expect(formatDuration(123.456)).toBe('123.46ms')
	})

	test('should format seconds (>= 1000ms)', () => {
		expect(formatDuration(1000)).toBe('1.00s')
		expect(formatDuration(1500)).toBe('1.50s')
		expect(formatDuration(60000)).toBe('60.00s')
		expect(formatDuration(12345)).toBe('12.35s')
	})

	test('should handle zero', () => {
		expect(formatDuration(0)).toBe('0μs')
	})

	test('should handle very small values', () => {
		expect(formatDuration(0.0001)).toBe('0μs')
	})

	test('should handle edge case at 1ms boundary', () => {
		expect(formatDuration(0.99999)).toBe('1000μs')
		expect(formatDuration(1.00001)).toBe('1.00ms')
	})

	test('should handle edge case at 1000ms boundary', () => {
		expect(formatDuration(999.99)).toBe('999.99ms')
		expect(formatDuration(1000.01)).toBe('1.00s')
	})
})
