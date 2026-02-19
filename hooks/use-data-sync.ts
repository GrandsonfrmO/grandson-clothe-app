'use client'

import { useEffect, useCallback } from 'react'

// Event emitter for data sync
class DataSyncEmitter {
  private listeners: Map<string, Set<() => void>> = new Map()

  on(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach(callback => callback())
  }
}

export const dataSyncEmitter = new DataSyncEmitter()

// Hook to listen for data sync events
export function useDataSync(event: string, callback: () => void) {
  useEffect(() => {
    return dataSyncEmitter.on(event, callback)
  }, [event, callback])
}

// Events
export const DATA_SYNC_EVENTS = {
  ORDER_CREATED: 'order:created',
  FAVORITE_ADDED: 'favorite:added',
  FAVORITE_REMOVED: 'favorite:removed',
  PROFILE_UPDATED: 'profile:updated',
}
