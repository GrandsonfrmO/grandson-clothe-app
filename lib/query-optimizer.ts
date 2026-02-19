// Query optimization and analysis
import { SupabaseClient } from '@supabase/supabase-js'

interface QueryStats {
  query: string
  executionTime: number
  rowsAffected: number
  cached: boolean
}

const queryStats: QueryStats[] = []
const MAX_STATS = 1000

export class QueryOptimizer {
  private supabase: SupabaseClient
  private enableStats: boolean

  constructor(supabase: SupabaseClient, enableStats: boolean = false) {
    this.supabase = supabase
    this.enableStats = enableStats
  }

  // Optimize SELECT queries with proper field selection
  async selectOptimized<T>(
    table: string,
    fields: string[] = ['*'],
    filters?: Record<string, any>,
    options?: { limit?: number; offset?: number; order?: string }
  ): Promise<T[]> {
    const startTime = performance.now()

    let query = this.supabase.from(table).select(fields.join(','))

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }

    // Apply pagination
    if (options?.limit) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }

    // Apply ordering
    if (options?.order) {
      const [field, direction] = options.order.split(':')
      query = query.order(field, { ascending: direction === 'asc' })
    }

    const { data, error } = await query

    if (error) throw error

    if (this.enableStats) {
      this.recordStat({
        query: `SELECT ${fields.join(',')} FROM ${table}`,
        executionTime: performance.now() - startTime,
        rowsAffected: (data as any[])?.length || 0,
        cached: false,
      })
    }

    return (data as T[]) || []
  }

  // Batch insert with optimization
  async insertBatch<T>(
    table: string,
    records: T[],
    batchSize: number = 100
  ): Promise<T[]> {
    const startTime = performance.now()
    const results: T[] = []

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      const { data, error } = await this.supabase.from(table).insert(batch).select()

      if (error) throw error
      results.push(...(data as T[]))
    }

    if (this.enableStats) {
      this.recordStat({
        query: `INSERT INTO ${table} (batch)`,
        executionTime: performance.now() - startTime,
        rowsAffected: results.length,
        cached: false,
      })
    }

    return results
  }

  // Batch update with optimization
  async updateBatch<T>(
    table: string,
    updates: Array<{ id: any; data: Partial<T> }>,
    batchSize: number = 50
  ): Promise<T[]> {
    const startTime = performance.now()
    const results: T[] = []

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)

      for (const { id, data } of batch) {
        const { data: updated, error } = await this.supabase
          .from(table)
          .update(data)
          .eq('id', id)
          .select()

        if (error) throw error
        results.push(...(updated as T[]))
      }
    }

    if (this.enableStats) {
      this.recordStat({
        query: `UPDATE ${table} (batch)`,
        executionTime: performance.now() - startTime,
        rowsAffected: results.length,
        cached: false,
      })
    }

    return results
  }

  // Aggregate query optimization
  async aggregate(
    table: string,
    aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max',
    field: string,
    filters?: Record<string, any>
  ): Promise<number> {
    const startTime = performance.now()

    let query = this.supabase.from(table).select(field, { count: 'exact' })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }

    const { data, count, error } = await query

    if (error) throw error

    let result = 0
    if (aggregation === 'count') {
      result = count || 0
    } else if (data && Array.isArray(data)) {
      const values = data.map((row: any) => row[field]).filter((v) => v !== null)
      switch (aggregation) {
        case 'sum':
          result = values.reduce((a, b) => a + b, 0)
          break
        case 'avg':
          result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          break
        case 'min':
          result = Math.min(...values)
          break
        case 'max':
          result = Math.max(...values)
          break
      }
    }

    if (this.enableStats) {
      this.recordStat({
        query: `${aggregation.toUpperCase()}(${field}) FROM ${table}`,
        executionTime: performance.now() - startTime,
        rowsAffected: 1,
        cached: false,
      })
    }

    return result
  }

  private recordStat(stat: QueryStats): void {
    queryStats.push(stat)
    if (queryStats.length > MAX_STATS) {
      queryStats.shift()
    }
  }

  getStats(): QueryStats[] {
    return [...queryStats]
  }

  getSlowQueries(threshold: number = 100): QueryStats[] {
    return queryStats.filter((s) => s.executionTime > threshold)
  }

  clearStats(): void {
    queryStats.length = 0
  }
}

export function createOptimizer(supabase: SupabaseClient): QueryOptimizer {
  return new QueryOptimizer(supabase, true)
}
