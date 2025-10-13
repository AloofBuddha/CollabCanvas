/**
 * Type definitions for CollabCanvas MVP
 * 
 * This file will be populated in PR #2 with:
 * - Shape types
 * - User types
 * - Cursor types
 * - Store interfaces
 */

// Placeholder - will be implemented in PR #2
export interface Shape {
  id: string
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  color: string
  createdBy: string
  lockedBy: string | null
}

export interface User {
  userId: string
  displayName: string
  color: string
  online: boolean
}

export interface Cursor {
  x: number
  y: number
}

export interface RemoteCursor extends Cursor {
  userId: string
  color: string
  name: string
}

