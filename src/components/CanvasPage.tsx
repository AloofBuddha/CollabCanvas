import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut } from '../utils/auth'
import {
  initCursorSync,
  listenToRemoteCursors,
  initUserPresence,
  listenToOnlineUsers,
} from '../utils/firebasePresence'
import {
  listenToShapes,
  saveShape,
  deleteShape,
  lockShape as lockShapeInFirestore,
  unlockShape as unlockShapeInFirestore,
} from '../utils/firebaseShapes'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import useShapeStore from '../stores/useShapeStore'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import Header from './Header'
import { Cursor, User, Shape } from '../types'

type Tool = 'select' | 'rectangle'

/**
 * Canvas Page - Main collaborative canvas view
 */
export default function CanvasPage() {
  const { userId, displayName, color } = useUserStore()
  const { setRemoteCursor, clearRemoteCursors } = useCursorStore()
  const { setShapes, lockShape, unlockShape } = useShapeStore()
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const updateCursorRef = useRef<((cursor: Cursor) => void) | null>(null)

  // Initialize cursor sync and presence
  useEffect(() => {
    if (!userId) return

    // Initialize presence (returns unsubscribe function)
    const unsubscribePresence = initUserPresence(userId, displayName, color)

    // Initialize cursor sync
    const updateCursor = initCursorSync(userId, displayName, color)
    updateCursorRef.current = updateCursor

    // Listen to remote cursors
    const unsubscribeCursors = listenToRemoteCursors(userId, (cursors) => {
      // Clear all first
      clearRemoteCursors()
      // Then set all remote cursors
      Object.entries(cursors).forEach(([cursorUserId, cursor]) => {
        setRemoteCursor(cursorUserId, cursor)
      })
    })

    // Listen to online users
    const unsubscribeUsers = listenToOnlineUsers((users) => {
      setOnlineUsers(users)
    })

    // Listen to Firestore shapes
    const unsubscribeShapes = listenToShapes((shapes) => {
      setShapes(shapes)
    })

    return () => {
      unsubscribePresence()
      unsubscribeCursors()
      unsubscribeUsers()
      unsubscribeShapes()
      clearRemoteCursors()
    }
  }, [userId, displayName, color, setRemoteCursor, clearRemoteCursors, setShapes])

  const handleCursorMove = useCallback((cursor: Cursor) => {
    if (updateCursorRef.current) {
      updateCursorRef.current(cursor)
    }
  }, [])

  // Handle shape creation - save to Firestore
  const handleShapeCreated = useCallback(async (shape: Shape) => {
    try {
      await saveShape(shape)
    } catch (error) {
      console.error('Failed to save shape:', error)
    }
  }, [])

  // Handle shape deletion - remove from Firestore
  const handleShapeDeleted = useCallback(async (shapeId: string) => {
    try {
      await deleteShape(shapeId)
    } catch (error) {
      console.error('Failed to delete shape:', error)
    }
  }, [])

  // Handle shape lock (when user selects or starts dragging)
  const handleShapeLock = useCallback(async (shapeId: string) => {
    if (!userId) return
    
    // Check if shape is already locked
    const shape = useShapeStore.getState().shapes[shapeId]
    
    // Don't steal locks from other users
    if (shape?.lockedBy && shape.lockedBy !== userId) {
      return
    }
    
    // Don't re-lock if we already own it
    if (shape?.lockedBy === userId) {
      return
    }
    
    try {
      lockShape(shapeId, userId) // Update local state immediately (optimistic)
      await lockShapeInFirestore(shapeId, userId) // Sync to Firestore
    } catch (error) {
      console.error('Failed to lock shape:', error)
      // Rollback optimistic update on error
      unlockShape(shapeId)
    }
  }, [userId, lockShape, unlockShape])

  // Handle shape unlock (when user deselects or stops dragging)
  const handleShapeUnlock = useCallback(async (shapeId: string) => {
    if (!userId) return
    
    // Only unlock if we own the lock
    const shape = useShapeStore.getState().shapes[shapeId]
    
    if (!shape) {
      return
    }
    
    if (shape.lockedBy && shape.lockedBy !== userId) {
      return // Don't unlock shapes locked by others
    }
    
    if (!shape.lockedBy) {
      return // Already unlocked
    }
    
    try {
      unlockShape(shapeId) // Update local state immediately (optimistic)
      await unlockShapeInFirestore(shapeId) // Sync to Firestore
    } catch (error) {
      console.error('Failed to unlock shape:', error)
    }
  }, [userId, unlockShape])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="w-screen h-screen bg-canvas-bg flex flex-col">
      {/* Header */}
      <Header
        displayName={displayName}
        color={color}
        onlineUsers={onlineUsers}
        currentUserId={userId}
        onSignOut={handleSignOut}
      />

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas
          tool={selectedTool}
          onToolChange={setSelectedTool}
          onCursorMove={handleCursorMove}
          onShapeCreated={handleShapeCreated}
          onShapeDeleted={handleShapeDeleted}
          onShapeLock={handleShapeLock}
          onShapeUnlock={handleShapeUnlock}
          onlineUsers={onlineUsers}
        />
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
      </div>
    </div>
  )
}

