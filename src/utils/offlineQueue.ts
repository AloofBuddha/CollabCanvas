/**
 * Offline Queue for Shape Operations
 * 
 * Queues shape operations when offline, then syncs them when back online
 */

import { Shape } from '../types'

const OFFLINE_QUEUE_KEY = 'collab-canvas-offline-queue'

interface QueuedOperation {
  type: 'create' | 'update' | 'delete'
  shapeId: string
  shape?: Shape
  timestamp: number
}

/**
 * Get all queued operations
 */
export function getQueuedOperations(): QueuedOperation[] {
  try {
    const stored = localStorage.getItem(OFFLINE_QUEUE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('[offlineQueue] Failed to get queued operations:', error)
    return []
  }
}

/**
 * Add an operation to the queue
 */
export function queueOperation(operation: Omit<QueuedOperation, 'timestamp'>): void {
  try {
    const queue = getQueuedOperations()
    queue.push({
      ...operation,
      timestamp: Date.now(),
    })
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('[offlineQueue] Failed to queue operation:', error)
  }
}

/**
 * Clear all queued operations (after successful sync)
 */
export function clearQueue(): void {
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY)
  } catch (error) {
    console.error('[offlineQueue] Failed to clear queue:', error)
  }
}

/**
 * Get the count of queued operations
 */
export function getQueueCount(): number {
  return getQueuedOperations().length
}

