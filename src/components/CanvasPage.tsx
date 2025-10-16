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
  // RTDB functions for real-time updates
  listenToRTDBShapes,
  syncShapeToRTDB,
  populateRTDBFromFirestore,
  removeShapeFromRTDB,
  // Cleanup functions
  unlockAllShapes,
  unlockUserShapes,
} from '../utils/firebaseShapes'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import useShapeStore from '../stores/useShapeStore'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import Header from './Header'
import LoadingSpinner from './LoadingSpinner'
import { Cursor, User, Shape } from '../types'

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text'

/**
 * Canvas Page - Main collaborative canvas view
 */
export default function CanvasPage() {
  const { userId, displayName, color } = useUserStore()
  const { lockShape, unlockShape, addShape, removeShape } = useShapeStore()
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isPresenceReady, setIsPresenceReady] = useState(false)
  const updateCursorRef = useRef<((cursor: Cursor) => void) | null>(null)
  const isFirstLoadRef = useRef(true)

  // Initialize cursor sync and presence
  useEffect(() => {
    if (!userId) {
      // Reset presence ready flag when no user
      setIsPresenceReady(false)
      return
    }

    // Reset presence ready flag at the start of initialization
    setIsPresenceReady(false)

    // Destructure Zustand actions at the top of the effect for cleaner code
    // We use getState() instead of destructuring at component level because:
    // 1. Zustand actions are stable references, but destructuring creates new refs on each render
    // 2. Including them in deps array causes infinite loops
    // 3. Using getState() inside callbacks/effects avoids React's reactivity system
    const { setUser } = useUserStore.getState()
    const { setRemoteCursor, clearRemoteCursors } = useCursorStore.getState()
    const { setShapes } = useShapeStore.getState()

    let unsubscribeRTDBShapes: (() => void) | null = null
    let unsubscribePresence: (() => void) | null = null

    // Initialize presence and get assigned color
    const setupPresence = async () => {
      const { unsubscribe, color: assignedColor } = await initUserPresence(userId, displayName)
      unsubscribePresence = unsubscribe
      
      // Update user store with assigned color
      setUser(userId, displayName, assignedColor)

      // Initialize cursor sync with assigned color
      const updateCursor = initCursorSync(userId, displayName, assignedColor)
      updateCursorRef.current = updateCursor
      
      // Mark presence as ready
      setIsPresenceReady(true)
    }
    
    setupPresence()

    // Listen to remote cursors
    const unsubscribeCursors = listenToRemoteCursors(userId, (cursors) => {
      // Get current remote cursors to determine what changed
      const currentCursors = useCursorStore.getState().remoteCursors
      const incomingUserIds = new Set(Object.keys(cursors))
      const currentUserIds = new Set(Object.keys(currentCursors))
      
      // Remove cursors that no longer exist (user disconnected)
      currentUserIds.forEach((cursorUserId) => {
        if (!incomingUserIds.has(cursorUserId)) {
          useCursorStore.getState().removeRemoteCursor(cursorUserId)
        }
      })
      
      // Add or update cursors that exist
      Object.entries(cursors).forEach(([cursorUserId, cursor]) => {
        setRemoteCursor(cursorUserId, cursor)
      })
    })

    // Listen to online users
    const unsubscribeUsers = listenToOnlineUsers((users) => {
      setOnlineUsers(users)
    })

    // Load shapes from Firestore ONCE, then subscribe to RTDB for real-time updates
    const unsubscribeFirestoreShapes = listenToShapes(async (firestoreShapes) => {
      // On first load, unlock all shapes (cleanup stale locks from crashed sessions)
      if (isFirstLoadRef.current) {
        await unlockAllShapes(firestoreShapes)
        isFirstLoadRef.current = false
        
        // Re-fetch shapes after unlocking to get the updated state
        // This ensures RTDB is populated with unlocked shapes
        const unlockedShapes = Object.fromEntries(
          Object.entries(firestoreShapes).map(([id, shape]) => [id, { ...shape, lockedBy: null }])
        )
        setShapes(unlockedShapes)
        await populateRTDBFromFirestore(unlockedShapes)
      } else {
        // Set initial shapes in Zustand
        setShapes(firestoreShapes)
        
        // Populate RTDB with Firestore shapes (this makes RTDB the cache)
        await populateRTDBFromFirestore(firestoreShapes)
      }
      
      // Now subscribe to RTDB for real-time updates
      // Only do this once (on first Firestore load)
      if (!unsubscribeRTDBShapes) {
        unsubscribeRTDBShapes = listenToRTDBShapes((rtdbShapes) => {
          setShapes(rtdbShapes)
        })
      }
      
      // After initial setup, unsubscribe from Firestore to prevent conflicts with RTDB
      // RTDB will handle all real-time updates, Firestore is only used for initial load
      unsubscribeFirestoreShapes()
    })

    return () => {
      // Unlock all shapes owned by this user before disconnecting
      if (userId) {
        // Get current shapes from store (don't use closure to avoid stale reference)
        const currentShapes = useShapeStore.getState().shapes
        unlockUserShapes(userId, currentShapes).catch(err => 
          console.error('Failed to unlock user shapes on disconnect:', err)
        )
      }
      
      if (unsubscribePresence) {
        unsubscribePresence()
      }
      unsubscribeCursors()
      unsubscribeUsers()
      unsubscribeFirestoreShapes()
      if (unsubscribeRTDBShapes) {
        unsubscribeRTDBShapes()
      }
      clearRemoteCursors()
    }
  }, [userId, displayName])

  const handleCursorMove = useCallback((cursor: Cursor) => {
    if (updateCursorRef.current) {
      updateCursorRef.current(cursor)
    }
  }, [])

  // Handle shape creation - save to both Firestore (persistence) and RTDB (real-time)
  const handleShapeCreated = useCallback(async (shape: Shape) => {
    // Optimistically add to local store immediately
    addShape(shape)
    
    try {
      // Write to both databases
      await Promise.all([
        saveShape(shape),          // Firestore for persistence
        syncShapeToRTDB(shape),    // RTDB for real-time sync
      ])
    } catch (error) {
      console.error('Failed to save shape:', error)
      // On error, remove from local store
      removeShape(shape.id)
    }
  }, [addShape, removeShape])

  // Handle shape deletion - remove from both Firestore and RTDB
  const handleShapeDeleted = useCallback(async (shapeId: string) => {
    try {
      // Remove from both databases
      await Promise.all([
        deleteShape(shapeId),           // Firestore
        removeShapeFromRTDB(shapeId),   // RTDB
      ])
    } catch (error) {
      console.error('Failed to delete shape:', error)
    }
  }, [])

  // Handle shape updates - persist to both databases
  const handleShapeUpdate = useCallback(async (shape: Shape) => {
    try {
      // Update both databases to ensure consistency
      await Promise.all([
        saveShape(shape),          // Firestore for persistence
        syncShapeToRTDB(shape),    // RTDB for real-time sync
      ])
    } catch (error) {
      console.error('Failed to update shape:', error)
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

  // Track last unlock time to prevent rapid fire calls
  const lastUnlockTime = useRef<number>(0)
  const UNLOCK_DEBOUNCE_MS = 100 // 100ms debounce

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
    
    // Debounce rapid unlock calls to prevent flickering
    const now = Date.now()
    if (now - lastUnlockTime.current < UNLOCK_DEBOUNCE_MS) {
      return
    }
    lastUnlockTime.current = now
    
    // Update local state immediately (optimistic) - this is synchronous
    unlockShape(shapeId)
    
    // Sync to Firestore in the next tick to avoid blocking the UI
    setTimeout(() => {
      unlockShapeInFirestore(shapeId).catch(error => {
        console.error('Failed to unlock shape in Firestore:', error)
      })
    }, 0)
  }, [userId, unlockShape])

  const handleSignOut = async () => {
    await signOut()
  }

  // Show loading spinner until presence is initialized and color is assigned
  if (!isPresenceReady || color === '#000000') {
    return <LoadingSpinner message="Initializing workspace..." />
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
          onShapeUpdate={handleShapeUpdate}
          onShapeLock={handleShapeLock}
          onShapeUnlock={handleShapeUnlock}
        />
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
      </div>
    </div>
  )
}

