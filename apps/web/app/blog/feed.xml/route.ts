import { blogPosts } from '@/lib/blog-manifest'
import { SITE_URL } from '@/lib/constants'

/**
 * Generate RSS 2.0 feed for the blog
 */
function generateRSSFeed(): string {
	const items = blogPosts
		.map(
			(post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedTime).toUTCString()}</pubDate>
    </item>`,
		)
		.join('')

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vestig Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Updates, release notes, tutorials, and insights about Vestig logging library.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>Vestig Blog</title>
      <link>${SITE_URL}/blog</link>
    </image>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>Next.js</generator>
    <managingEditor>noreply@vestig.dev (Vestig Team)</managingEditor>
    <webMaster>noreply@vestig.dev (Vestig Team)</webMaster>
    <category>Technology</category>
    <category>Programming</category>
    <category>TypeScript</category>
    <category>Logging</category>
    ${items}
  </channel>
</rss>`
}

export async function GET() {
	const feed = generateRSSFeed()

	return new Response(feed, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	})
}
