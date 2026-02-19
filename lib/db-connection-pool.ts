// Database connection pooling and optimization
import { createClient } from '@supabase/supabase-js'

interface PoolConfig {
  maxConnections: number
  minConnections: number
  idleTimeout: number // ms
  acquireTimeout: number // ms
}

const DEFAULT_CONFIG: PoolConfig = {
  maxConnections: 10,
  minConnections: 2,
  idleTimeout: 30000, // 30 seconds
  acquireTimeout: 5000, // 5 seconds
}

class ConnectionPool {
  private available: any[] = []
  private inUse: Set<any> = new Set()
  private config: PoolConfig
  private supabaseUrl: string
  private supabaseKey: string

  constructor(supabaseUrl: string, supabaseKey: string, config: Partial<PoolConfig> = {}) {
    this.supabaseUrl = supabaseUrl
    this.supabaseKey = supabaseKey
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.initializePool()
  }

  private initializePool(): void {
    for (let i = 0; i < this.config.minConnections; i++) {
      this.available.push(this.createConnection())
    }
  }

  private createConnection(): any {
    return createClient(this.supabaseUrl, this.supabaseKey)
  }

  async acquire(): Promise<any> {
    // Return available connection
    if (this.available.length > 0) {
      return this.available.pop()
    }

    // Create new connection if under limit
    if (this.inUse.size < this.config.maxConnections) {
      const conn = this.createConnection()
      this.inUse.add(conn)
      return conn
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection acquire timeout'))
      }, this.config.acquireTimeout)

      const checkAvailable = setInterval(() => {
        if (this.available.length > 0) {
          clearTimeout(timeout)
          clearInterval(checkAvailable)
          resolve(this.available.pop())
        }
      }, 100)
    })
  }

  release(connection: any): void {
    this.inUse.delete(connection)
    this.available.push(connection)

    // Remove connection if idle too long
    setTimeout(() => {
      const index = this.available.indexOf(connection)
      if (index !== -1 && this.available.length > this.config.minConnections) {
        this.available.splice(index, 1)
      }
    }, this.config.idleTimeout)
  }

  async execute<T>(callback: (conn: any) => Promise<T>): Promise<T> {
    const conn = await this.acquire()
    try {
      return await callback(conn)
    } finally {
      this.release(conn)
    }
  }

  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    }
  }

  drain(): void {
    this.available = []
    this.inUse.clear()
  }
}

// Global pool instance
let pool: ConnectionPool | null = null

export function initializePool(
  supabaseUrl: string,
  supabaseKey: string,
  config?: Partial<PoolConfig>
): ConnectionPool {
  if (!pool) {
    pool = new ConnectionPool(supabaseUrl, supabaseKey, config)
  }
  return pool
}

export function getPool(): ConnectionPool {
  if (!pool) {
    throw new Error('Connection pool not initialized')
  }
  return pool
}

export async function executeWithPool<T>(
  callback: (conn: any) => Promise<T>
): Promise<T> {
  const p = getPool()
  return p.execute(callback)
}

export function getPoolStats(): { available: number; inUse: number; total: number } {
  if (!pool) {
    return { available: 0, inUse: 0, total: 0 }
  }
  return pool.getStats()
}

export function drainPool(): void {
  if (pool) {
    pool.drain()
  }
}
