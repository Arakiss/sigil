/**
 * Circular buffer configuration
 */
export interface CircularBufferConfig {
	maxSize: number
	onDrop?: (items: unknown[]) => void
}

/**
 * A memory-safe circular buffer for storing log entries
 *
 * Implements the Iterable protocol for use with for...of loops
 */
export class CircularBuffer<T> implements Iterable<T> {
	private buffer: (T | undefined)[]
	private head = 0
	private tail = 0
	private count = 0
	private dropped = 0
	private readonly maxSize: number
	private readonly onDrop?: (items: T[]) => void

	constructor(config: CircularBufferConfig) {
		this.maxSize = config.maxSize
		this.buffer = new Array(config.maxSize)
		this.onDrop = config.onDrop as (items: T[]) => void
	}

	/**
	 * Add an item to the buffer
	 */
	push(item: T): void {
		if (this.count === this.maxSize) {
			// Buffer full, drop oldest
			const dropped = this.buffer[this.head]
			if (dropped !== undefined && this.onDrop) {
				this.onDrop([dropped])
			}
			this.head = (this.head + 1) % this.maxSize
			this.dropped++
		} else {
			this.count++
		}

		this.buffer[this.tail] = item
		this.tail = (this.tail + 1) % this.maxSize
	}

	/**
	 * Remove and return the oldest item
	 */
	shift(): T | undefined {
		if (this.count === 0) return undefined

		const item = this.buffer[this.head]
		this.buffer[this.head] = undefined
		this.head = (this.head + 1) % this.maxSize
		this.count--

		return item
	}

	/**
	 * Get the oldest item without removing
	 */
	peek(): T | undefined {
		if (this.count === 0) return undefined
		return this.buffer[this.head]
	}

	/**
	 * Convert buffer to array (oldest first)
	 */
	toArray(): T[] {
		const result: T[] = []
		for (const item of this) {
			result.push(item)
		}
		return result
	}

	/**
	 * Iterator implementation for for...of loops
	 *
	 * Iterates from oldest to newest without removing items.
	 *
	 * @example
	 * ```typescript
	 * const buffer = new CircularBuffer<number>({ maxSize: 10 })
	 * buffer.push(1)
	 * buffer.push(2)
	 * buffer.push(3)
	 *
	 * for (const item of buffer) {
	 *   console.log(item)  // 1, 2, 3
	 * }
	 *
	 * // Spread operator
	 * const arr = [...buffer]  // [1, 2, 3]
	 *
	 * // Array.from
	 * const arr2 = Array.from(buffer)  // [1, 2, 3]
	 * ```
	 */
	*[Symbol.iterator](): Iterator<T> {
		let index = this.head
		for (let i = 0; i < this.count; i++) {
			const item = this.buffer[index]
			if (item !== undefined) {
				yield item
			}
			index = (index + 1) % this.maxSize
		}
	}

	/**
	 * Returns an iterator over buffer values (oldest first)
	 *
	 * Alias for [Symbol.iterator]() for explicit usage.
	 */
	values(): IterableIterator<T> {
		return this[Symbol.iterator]() as IterableIterator<T>
	}

	/**
	 * Clear the buffer
	 */
	clear(): void {
		this.buffer = new Array(this.maxSize)
		this.head = 0
		this.tail = 0
		this.count = 0
	}

	/**
	 * Get current size
	 */
	get size(): number {
		return this.count
	}

	/**
	 * Get dropped count
	 */
	get droppedCount(): number {
		return this.dropped
	}

	/**
	 * Check if buffer is full
	 */
	get isFull(): boolean {
		return this.count === this.maxSize
	}

	/**
	 * Get buffer statistics
	 */
	getStats(): { size: number; maxSize: number; dropped: number; utilization: number } {
		return {
			size: this.count,
			maxSize: this.maxSize,
			dropped: this.dropped,
			utilization: this.count / this.maxSize,
		}
	}
}
