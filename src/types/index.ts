/**
 * Type definitions for CollabCanvas MVP
 */

// ============================================================================
// Shape Types
// ============================================================================

export interface Shape {
  id: string
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  rotation?: number // Rotation in degrees (default 0)
  color: string
  createdBy: string
  lockedBy?: string | null // userId of user who has locked this shape
}

// ============================================================================
// User Types
// ============================================================================

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

export interface User {
  userId: string
  displayName: string
  color: string
}

// ============================================================================
// Cursor Types
// ============================================================================

export interface Cursor {
  x: number
  y: number
}

export interface RemoteCursor extends Cursor {
  userId: string
  color: string
  name: string
}

// ============================================================================
// Store State Types
// ============================================================================

export interface UserState {
  userId: string | null
  displayName: string
  color: string
  online: boolean
  authStatus: AuthStatus
  setUser: (userId: string, displayName: string, color: string) => void
  setAuthStatus: (status: AuthStatus) => void
  setOnline: (online: boolean) => void
  logout: () => void
}

export interface CursorState {
  localCursor: Cursor
  remoteCursors: Record<string, RemoteCursor>
  setLocalCursor: (cursor: Cursor) => void
  setRemoteCursor: (userId: string, cursor: RemoteCursor) => void
  removeRemoteCursor: (userId: string) => void
  clearRemoteCursors: () => void
}

export interface ShapeState {
  shapes: Record<string, Shape>
  addShape: (shape: Shape) => void
  updateShape: (id: string, updates: Partial<Shape>) => void
  removeShape: (id: string) => void
  lockShape: (id: string, userId: string) => void
  unlockShape: (id: string) => void
  setShapes: (shapes: Record<string, Shape>) => void
  clearShapes: () => void
}
