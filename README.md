# logpulse

A modern, runtime-agnostic logging library for Next.js. Zero config, TypeScript-first, with automatic sanitization.

[![npm version](https://img.shields.io/npm/v/logpulse.svg)](https://www.npmjs.com/package/logpulse)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Zero Config** - Works out of the box with sensible defaults
- **Runtime Agnostic** - Node.js, Bun, Edge Runtime, Browser
- **Next.js Optimized** - First-class support for App Router, middleware, and Edge
- **TypeScript First** - Full type safety and IntelliSense
- **Auto Sanitization** - PII protection enabled by default
- **Context Propagation** - AsyncLocalStorage support for request tracing
- **W3C Trace Context** - Standard correlation IDs for distributed tracing

## Installation

```bash
# npm
npm install logpulse

# bun
bun add logpulse

# pnpm
pnpm add logpulse
```

## Quick Start

```typescript
import { log } from 'logpulse'

// Simple logging
log.info('Hello world')
log.error('Something failed', { userId: 123 })

// With metadata
log.info('User action', {
  action: 'login',
  userId: 123,
  // Sensitive data is automatically redacted
  password: 'secret123' // → [REDACTED]
})
```

## Custom Logger

```typescript
import { createLogger } from 'logpulse'

const log = createLogger({
  level: 'debug',
  structured: true, // JSON output
  context: { service: 'api', version: '1.0.0' }
})

log.info('Server started')
// {"timestamp":"...","level":"info","message":"Server started","context":{"service":"api","version":"1.0.0"}}
```

## Child Loggers

```typescript
const log = createLogger({ namespace: 'app' })
const dbLog = log.child('database')
const cacheLog = log.child('cache')

dbLog.info('Query executed')  // [app:database] Query executed
cacheLog.info('Cache hit')    // [app:cache] Cache hit
```

## Context & Correlation IDs

```typescript
import { withContext, createCorrelationContext } from 'logpulse'

// Next.js API Route
export async function GET(req: Request) {
  const context = createCorrelationContext({
    requestId: req.headers.get('x-request-id') ?? undefined
  })

  return withContext(context, async () => {
    log.info('Request started')
    // All logs include: requestId, traceId, spanId

    const result = await fetchData()
    log.info('Request completed')

    return Response.json(result)
  })
}
```

## Configuration

### Environment Variables

```bash
LOGPULSE_LEVEL=debug        # trace | debug | info | warn | error
LOGPULSE_ENABLED=true       # Enable/disable logging
LOGPULSE_STRUCTURED=true    # JSON output (auto-enabled in production)
LOGPULSE_SANITIZE=true      # PII sanitization (default: true)

# Add to context
LOGPULSE_CONTEXT_SERVICE=api
LOGPULSE_CONTEXT_VERSION=1.0.0
```

### Programmatic

```typescript
const log = createLogger({
  level: 'debug',
  enabled: true,
  structured: false,
  sanitize: true,
  sanitizeFields: ['customSecret'],
  context: { environment: 'development' }
})
```

## Log Levels

| Level | Description |
|-------|-------------|
| `trace` | Very detailed debugging information |
| `debug` | Development debugging |
| `info` | General information |
| `warn` | Warning messages |
| `error` | Error messages (includes stack traces) |

## Runtime Detection

logpulse automatically detects and adapts to:

- **Node.js** - Full features with AsyncLocalStorage
- **Bun** - Full features with AsyncLocalStorage
- **Edge Runtime** - Vercel Edge, Cloudflare Workers
- **Browser** - Client-side logging with sanitization
- **Web Workers** - Background processing

```typescript
import { RUNTIME, IS_SERVER, IS_EDGE } from 'logpulse'

console.log(RUNTIME) // 'node' | 'bun' | 'edge' | 'browser' | 'worker'
```

## Auto-Production Mode

In production (`NODE_ENV=production`), logpulse automatically:

- Sets log level to `warn`
- Enables structured (JSON) output
- Keeps sanitization enabled

## API Reference

### `createLogger(config?)`

Create a new logger instance.

### `log.trace/debug/info/warn/error(message, metadata?)`

Log at the specified level.

### `log.child(namespace, config?)`

Create a namespaced child logger.

### `withContext(context, fn)`

Run a function with the given context.

### `createCorrelationContext(existing?)`

Generate correlation IDs (requestId, traceId, spanId).

## Migration from nexlog

```diff
- import logger from 'nexlog'
+ import { log } from 'logpulse'

- import { Logger } from 'nexlog'
+ import { createLogger } from 'logpulse'
```

## License

MIT
