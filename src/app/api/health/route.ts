// Health check endpoint per monitoring

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const startTime = Date.now()

    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.__NEXT_VERSION || 'unknown',
      checks: {
        memory: {
          status: 'ok',
          used: process.memoryUsage(),
        },
        database: {
          status: 'ok', // TODO: Add actual DB health check
          connected: true,
        },
        api: {
          status: 'ok',
          responseTime: Date.now() - startTime,
        },
      },
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
