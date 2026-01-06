export type {
	NamespaceSamplerConfig,
	ProbabilitySamplerConfig,
	RateLimitSamplerConfig,
	Sampler,
	SamplerConfig,
	SamplerFn,
	SamplingConfig,
} from './types'

export {
	createCompositeSampler,
	createNamespaceSampler,
	createProbabilitySampler,
	createRateLimitSampler,
	createSampler,
	createSamplerFromConfig,
} from './sampler'

// Tail sampling for wide events
export { TailSampler, createTailSampler } from './tail'
export type { TailSamplingResult } from './tail'
