import { createLogStream, logStore } from '@/lib/demo-transport'
import type { LogEntry } from 'vestig'

/**
 * GET /api/logs - Server-Sent Events stream for real-time logs
 *
 * This endpoint creates an SSE connection that streams log entries
 * to connected clients in real-time.
 *
 * The stream sends:
 * 1. Recent logs (last 50) immediately on connection
 * 2. New logs as they occur
 *
 * Each message is formatted as:
 * `data: { ...LogEntry }\n\n`
 */
export async function GET() {
  const stream = createLogStream()

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}

/**
 * POST /api/logs - Receive log entries from client-side
 *
 * Client components can't directly add to the server-side log store,
 * so they POST their logs here to be included in the unified stream.
 */
export async function POST(request: Request) {
  try {
    const entry = (await request.json()) as LogEntry

    // Validate required fields
    if (!entry.timestamp || !entry.level || !entry.message) {
      return Response.json(
        { error: 'Invalid log entry: missing required fields' },
        { status: 400 }
      )
    }

    // Add unique ID if not present
    const entryWithId = {
      ...entry,
      id: `${entry.timestamp}-${Math.random().toString(36).slice(2, 9)}`,
    }

    // Add to the store (will notify SSE subscribers)
    logStore.add(entryWithId as LogEntry)

    return Response.json({ success: true })
  } catch (error) {
    return Response.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/logs - Clear all stored logs
 *
 * Useful for demo purposes to reset the log viewer
 */
export async function DELETE() {
  logStore.clear()
  return Response.json({ success: true, message: 'Logs cleared' })
}
