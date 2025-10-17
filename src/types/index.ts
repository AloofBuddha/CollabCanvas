/**
 * Type definitions for CollabCanvas MVP
 */

// ============================================================================
// Shape Types
// ============================================================================

// Base shape properties shared by all shapes
interface BaseShape {
  id: string
  x: number
  y: number
  rotation?: number // Rotation in degrees (default 0)
  opacity?: number // Opacity 0-1 (default 1.0, fully opaque)
  zIndex?: number // Layering order (higher = on top, default based on creation timestamp)
  color: string
  createdBy: string
  lockedBy?: string | null // userId of user who has locked this shape
}

// Rectangle shape
export interface RectangleShape extends BaseShape {
  type: 'rectangle'
  width: number
  height: number
  stroke?: string
  strokeWidth?: number
}

// Circle shape
export interface CircleShape extends BaseShape {
  type: 'circle'
  radiusX: number
  radiusY: number
  stroke?: string
  strokeWidth?: number
}

// Line shape
export interface LineShape extends BaseShape {
  type: 'line'
  x2: number
  y2: number
  strokeWidth: number
}

// Text shape
export interface TextShape extends BaseShape {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  textColor: string
  width: number // Width of text box
  height: number // Height of text box
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

// Discriminated union of all shape types
export type Shape = RectangleShape | CircleShape | LineShape | TextShape

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
  setUser: (userId: string, displayName: string, color?: string) => void
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
