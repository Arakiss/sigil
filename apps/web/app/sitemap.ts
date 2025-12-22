import type { MetadataRoute } from 'next'

const BASE_URL = 'https://vestig.dev'

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date()

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 1.0,
		},
		{
			url: `${BASE_URL}/playground`,
			lastModified: now,
			changeFrequency: 'monthly',
			priority: 0.8,
		},
	]

	// Documentation pages
	const docPages = [
		// Main docs
		{ path: '/docs', priority: 0.9 },
		{ path: '/docs/getting-started', priority: 0.95 },
		{ path: '/docs/features', priority: 0.85 },
		{ path: '/docs/api', priority: 0.8 },

		// Core concepts
		{ path: '/docs/core/logging', priority: 0.85 },
		{ path: '/docs/core/levels', priority: 0.8 },
		{ path: '/docs/core/structured', priority: 0.8 },
		{ path: '/docs/core/child-loggers', priority: 0.75 },

		// Tracing
		{ path: '/docs/tracing', priority: 0.9 },
		{ path: '/docs/tracing/spans', priority: 0.85 },

		// Security
		{ path: '/docs/security/sanitization', priority: 0.9 },

		// Sampling
		{ path: '/docs/sampling', priority: 0.85 },

		// Transports
		{ path: '/docs/transports', priority: 0.85 },

		// Next.js Integration
		{ path: '/docs/nextjs', priority: 0.9 },
		{ path: '/docs/nextjs/middleware', priority: 0.8 },
		{ path: '/docs/nextjs/server-components', priority: 0.8 },
		{ path: '/docs/nextjs/route-handlers', priority: 0.8 },
		{ path: '/docs/nextjs/server-actions', priority: 0.8 },
		{ path: '/docs/nextjs/client', priority: 0.8 },

		// API Reference
		{ path: '/docs/api/next', priority: 0.75 },
	]

	const docSitemap: MetadataRoute.Sitemap = docPages.map(({ path, priority }) => ({
		url: `${BASE_URL}${path}`,
		lastModified: now,
		changeFrequency: 'weekly' as const,
		priority,
	}))

	// Blog pages
	const blogPages = [
		{ path: '/blog', priority: 0.9 },
		{ path: '/blog/vestig-v0.7.0-deno-sampling', priority: 0.85 },
		{ path: '/blog/why-vestig', priority: 0.85 },
	]

	const blogSitemap: MetadataRoute.Sitemap = blogPages.map(({ path, priority }) => ({
		url: `${BASE_URL}${path}`,
		lastModified: now,
		changeFrequency: 'weekly' as const,
		priority,
	}))

	// Playground pages
	const playgroundPages = [
		'/playground/sanitization',
		'/playground/server',
		'/playground/client',
		'/playground/api-routes',
		'/playground/actions',
		'/playground/edge',
		'/playground/transports',
	]

	const playgroundSitemap: MetadataRoute.Sitemap = playgroundPages.map((path) => ({
		url: `${BASE_URL}${path}`,
		lastModified: now,
		changeFrequency: 'monthly' as const,
		priority: 0.6,
	}))

	return [...staticPages, ...docSitemap, ...blogSitemap, ...playgroundSitemap]
}
