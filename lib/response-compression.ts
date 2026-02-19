// Response compression and optimization
import { NextResponse } from 'next/server'

interface CompressionOptions {
  minSize?: number // Minimum size to compress (default: 1KB)
  level?: number // Compression level 1-9 (default: 6)
}

export function createOptimizedResponse(
  data: any,
  options: CompressionOptions = {}
): NextResponse {
  const { minSize = 1024, level = 6 } = options

  const json = JSON.stringify(data)
  const size = Buffer.byteLength(json)

  // Only compress if size exceeds minimum
  if (size < minSize) {
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'identity',
        'Cache-Control': 'public, max-age=300, s-maxage=1800',
      },
    })
  }

  // Return with gzip headers (server will handle compression)
  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
      'Cache-Control': 'public, max-age=300, s-maxage=1800',
      'Vary': 'Accept-Encoding',
    },
  })
}

// Optimize JSON response by removing unnecessary fields
export function optimizeResponse(data: any, fieldsToKeep?: string[]): any {
  if (Array.isArray(data)) {
    return data.map((item) => optimizeResponse(item, fieldsToKeep))
  }

  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (fieldsToKeep) {
    const optimized: any = {}
    fieldsToKeep.forEach((field) => {
      if (field in data) {
        optimized[field] = data[field]
      }
    })
    return optimized
  }

  return data
}

// Paginate large responses
export function paginateResponse(
  data: any[],
  page: number = 1,
  limit: number = 20
): { data: any[]; pagination: { page: number; limit: number; total: number; pages: number } } {
  const total = data.length
  const pages = Math.ceil(total / limit)
  const offset = (page - 1) * limit

  return {
    data: data.slice(offset, offset + limit),
    pagination: {
      page,
      limit,
      total,
      pages,
    },
  }
}

// Stream large responses
export async function* streamResponse(data: any[], chunkSize: number = 100) {
  for (let i = 0; i < data.length; i += chunkSize) {
    yield data.slice(i, i + chunkSize)
    // Allow other tasks to run
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}
