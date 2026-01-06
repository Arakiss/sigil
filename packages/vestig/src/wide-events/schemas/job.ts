/**
 * Background job fields for wide events.
 *
 * These fields capture information about async job execution
 * for observability and debugging of background processing.
 */
export interface JobFields {
	/** Unique job identifier */
	id?: string
	/** Job type/name (e.g., 'email_digest', 'data_sync') */
	type?: string
	/** Queue name */
	queue?: string
	/** Job priority (lower = higher priority) */
	priority?: number
	/** Current attempt number */
	attempt?: number
	/** Maximum retry attempts allowed */
	max_attempts?: number
	/** Scheduled execution time (ISO 8601) */
	scheduled_at?: string
	/** Actual start time (ISO 8601) */
	started_at?: string
	/** Completion time (ISO 8601) */
	completed_at?: string
	/** Job status (queued, running, completed, failed, cancelled) */
	status?: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
	/** Parent job ID (for child/dependent jobs) */
	parent_job_id?: string
	/** Batch ID (for batch processing) */
	batch_id?: string
	/** Worker/processor that executed the job */
	worker_id?: string
}

/**
 * Job input/output fields for wide events.
 */
export interface JobDataFields {
	/** Number of input items to process */
	input_count?: number
	/** Input data size in bytes */
	input_size_bytes?: number
	/** Number of items successfully processed */
	success_count?: number
	/** Number of items that failed */
	failure_count?: number
	/** Number of items skipped */
	skipped_count?: number
	/** Output data size in bytes */
	output_size_bytes?: number
}

/**
 * Job performance metrics.
 */
export interface JobPerformanceFields {
	/** Total execution time in ms */
	duration_ms?: number
	/** Time spent waiting in queue in ms */
	queue_time_ms?: number
	/** Processing time in ms */
	processing_time_ms?: number
	/** Memory used in bytes */
	memory_used_bytes?: number
	/** CPU time in ms */
	cpu_time_ms?: number
	/** Number of database queries */
	db_query_count?: number
	/** Total database time in ms */
	db_query_time_ms?: number
	/** Number of external API calls */
	external_call_count?: number
	/** Total external call time in ms */
	external_call_time_ms?: number
}

/**
 * Job error fields.
 */
export interface JobErrorFields {
	/** Error type/class name */
	type?: string
	/** Error code */
	code?: string | number
	/** Error message */
	message?: string
	/** Whether the job should be retried */
	retriable?: boolean
	/** Next retry time (ISO 8601) */
	retry_at?: string
	/** Backoff duration in ms */
	backoff_ms?: number
}

/**
 * Complete background job event fields structure.
 *
 * This interface represents all the categories of fields
 * typically captured for a background job wide event.
 */
export interface BackgroundJobEventFields {
	job?: Record<string, unknown>
	job_data?: Record<string, unknown>
	performance?: Record<string, unknown>
	error?: Record<string, unknown>
	service?: Record<string, unknown>
	[category: string]: Record<string, unknown> | undefined
}

/**
 * Helper to create typed background job fields.
 *
 * @example
 * ```typescript
 * const event = createWideEvent({ type: 'job.execute' });
 * event.mergeAll(jobFields({
 *   job: { id: 'job-123', type: 'email_digest', attempt: 1 },
 *   job_data: { input_count: 100, success_count: 98, failure_count: 2 },
 *   performance: { duration_ms: 5420, db_query_count: 50 }
 * }));
 * ```
 */
export function jobFields(fields: Partial<BackgroundJobEventFields>): BackgroundJobEventFields {
	return fields as BackgroundJobEventFields
}

/**
 * Common job event type constants.
 */
export const JOB_EVENT_TYPES = {
	EXECUTE: 'job.execute',
	COMPLETE: 'job.complete',
	FAIL: 'job.fail',
	RETRY: 'job.retry',
	CANCEL: 'job.cancel',
} as const
