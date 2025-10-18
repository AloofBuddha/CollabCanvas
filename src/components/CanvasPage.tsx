import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut } from '../utils/auth'
import toast, { Toaster } from 'react-hot-toast'
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
  batchUpdateShapeFields,
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
import AICommandInput from './AIAgent/AICommandInput'
import KeyboardShortcutsGuide from './KeyboardShortcutsGuide'
import { useAIAgent } from '../hooks/useAIAgent'
import { CanvasContext } from '../types/aiAgent'
import { Cursor, User, Shape, CircleShape, RectangleShape, TextShape, LineShape } from '../types'

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text'

/**
 * Canvas Page - Main collaborative canvas view
 */
export default function CanvasPage() {
  const { userId, displayName, color } = useUserStore()
  const { lockShape, unlockShape, addShape, removeShape, shapes } = useShapeStore()
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [isPresenceReady, setIsPresenceReady] = useState(false)
  const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const updateCursorRef = useRef<((cursor: Cursor) => void) | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  
  // Note: Keyboard shortcuts are handled in Canvas component where it has access to selection state
  
  // AI Agent
  const aiAgent = useAIAgent({
    userId: userId || '',
    onShapesCreated: async (newShapes) => {
      // Lock all shapes being created
      for (const shape of newShapes) {
        await handleShapeCreated(shape)
      }
      toast.success(`Created ${newShapes.length} shape${newShapes.length > 1 ? 's' : ''}!`)
    },
    onShapesUpdated: async (command) => {
      // Find shapes to update
      let shapesToUpdate: Shape[] = []

      if (command.useSelected) {
        // Update selected shapes
        shapesToUpdate = Object.values(shapes).filter(s => s.lockedBy === userId)
      } else if (command.shapeName) {
        // Update by name
        const shape = Object.values(shapes).find(s => s.name === command.shapeName)
        if (shape) {
          shapesToUpdate = [shape]
        }
      } else if (command.shapeId) {
        // Update by ID
        const shape = shapes[command.shapeId]
        if (shape) {
          shapesToUpdate = [shape]
        }
      } else if (command.selector) {
        // Update by selector (e.g., all circles)
        shapesToUpdate = Object.values(shapes).filter(s => {
          if (command.selector?.type && s.type !== command.selector.type) return false
          // Add more selector logic here if needed
          return true
        })
      }

      if (shapesToUpdate.length === 0) {
        toast.error('No shapes found to update')
        return
      }

      // Special handling for alignment and distribute commands
      // Check if updates contain x or y coordinate changes
      const hasXUpdate = 'x' in command.updates && typeof command.updates.x === 'number'
      const hasYUpdate = 'y' in command.updates && typeof command.updates.y === 'number'
      
      if (command.updates && (hasXUpdate || hasYUpdate)) {
        // Determine which coordinate is being updated (prefer x if both exist)
        const updateKey = hasXUpdate ? 'x' : 'y'
        const updateValue = command.updates[updateKey] as number

        // Check if this looks like an alignment or distribute command
        if ((updateKey === 'x' || updateKey === 'y') && typeof updateValue === 'number' && !isNaN(updateValue)) {
          // Helpers to approximate shape dimensions for spacing calculations
          const getApproxWidth = (s: Shape): number => {
            if (s.type === 'circle') {
              const circleShape = s as CircleShape
              const rx = circleShape.radiusX
              return rx * 2
            }
            if (s.type === 'rectangle') {
              const rectShape = s as RectangleShape
              return rectShape.width
            }
            if (s.type === 'text') {
              const textShape = s as TextShape
              return textShape.width
            }
            if (s.type === 'line') {
              const lineShape = s as LineShape
              const x2 = lineShape.x2
              return Math.max(1, Math.abs(x2 - s.x))
            }
            return 100
          }

          const getApproxHeight = (s: Shape): number => {
            if (s.type === 'circle') {
              const circleShape = s as CircleShape
              const ry = circleShape.radiusY
              return ry * 2
            }
            if (s.type === 'rectangle') {
              const rectShape = s as RectangleShape
              return rectShape.height
            }
            if (s.type === 'text') {
              const textShape = s as TextShape
              return textShape.height
            }
            if (s.type === 'line') {
              const lineShape = s as LineShape
              const y2 = lineShape.y2
              return Math.max(1, Math.abs(y2 - s.y))
            }
            return 100
          }
          // Check if this is a distribute command (has 'distribute' marker or 'gap' property)
          const isDistribute = command.updates.distribute === true || command.updates.gap !== undefined
          
          if (isDistribute && (updateKey === 'x' || updateKey === 'y')) {
            // DISTRIBUTE COMMAND: spread shapes along specified axis AND align on perpendicular axis
            const customGap = command.updates.gap as number | undefined
            
            if (updateKey === 'x') {
              // Horizontal distribution: 
              // 1. Align vertically (set all Y to same value)
              // 2. Spread horizontally with gaps
              const maxW = Math.max(...shapesToUpdate.map(getApproxWidth))
              const gap = customGap !== undefined ? customGap : 20 // Use custom gap or default 20px
              const spacing = maxW + gap
              const totalWidth = (shapesToUpdate.length - 1) * spacing
              const startX = updateValue - totalWidth / 2
              
              // Calculate average Y for alignment
              const avgY = shapesToUpdate.reduce((sum, s) => sum + s.y, 0) / shapesToUpdate.length

              // Create individual update commands for each shape
              for (let i = 0; i < shapesToUpdate.length; i++) {
                const shape = shapesToUpdate[i]
                const newX = startX + (i * spacing)
                const updatedShape = { ...shape, x: newX, y: avgY } // Set X for distribution, Y for alignment
                await handleShapeUpdate(updatedShape)
              }

              const gapMsg = customGap !== undefined ? ` with ${customGap}px gaps` : ''
              toast.success(`Horizontally distributed ${shapesToUpdate.length} shape${shapesToUpdate.length > 1 ? 's' : ''}${gapMsg}`)
              return
            }

            if (updateKey === 'y') {
              // Vertical distribution:
              // 1. Align horizontally (set all X to same value)
              // 2. Spread vertically with gaps
              const maxH = Math.max(...shapesToUpdate.map(getApproxHeight))
              const gap = customGap !== undefined ? customGap : 20 // Use custom gap or default 20px
              const spacing = maxH + gap
              const totalHeight = (shapesToUpdate.length - 1) * spacing
              const startY = updateValue - totalHeight / 2
              
              // Calculate average X for alignment
              const avgX = shapesToUpdate.reduce((sum, s) => sum + s.x, 0) / shapesToUpdate.length

              // Create individual update commands for each shape
              for (let i = 0; i < shapesToUpdate.length; i++) {
                const shape = shapesToUpdate[i]
                const newY = startY + (i * spacing)
                const updatedShape = { ...shape, x: avgX, y: newY } // Set X for alignment, Y for distribution
                await handleShapeUpdate(updatedShape)
              }

              const gapMsg = customGap !== undefined ? ` with ${customGap}px gaps` : ''
              toast.success(`Vertically distributed ${shapesToUpdate.length} shape${shapesToUpdate.length > 1 ? 's' : ''}${gapMsg}`)
              return
            }
          }

          // ALIGNMENT COMMAND: set all shapes to same coordinate
          if (!isDistribute && (updateKey === 'x' || updateKey === 'y')) {
            // Simple alignment - just set all shapes to the same coordinate
            for (const shape of shapesToUpdate) {
              const updatedShape = { ...shape, [updateKey]: updateValue }
              await handleShapeUpdate(updatedShape)
            }
            
            const alignmentType = updateKey === 'x' ? 'vertically' : 'horizontally'
            toast.success(`${alignmentType.charAt(0).toUpperCase() + alignmentType.slice(1)} aligned ${shapesToUpdate.length} shape${shapesToUpdate.length > 1 ? 's' : ''}`)
            return
          }
        }
      }

      // Default update logic for all update commands (including center commands)
      for (const shape of shapesToUpdate) {
        // Process relative updates (e.g., "+50" means add 50 to current value)
        const processedUpdates: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(command.updates)) {
          if (typeof value === 'string' && (value.startsWith('+') || value.startsWith('-'))) {
            // Relative update: "+50" or "-20"
            const delta = parseFloat(value)
            const currentValue = (shape as unknown as Record<string, unknown>)[key]
            if (typeof currentValue === 'number') {
              processedUpdates[key] = currentValue + delta
            } else {
              processedUpdates[key] = value // Fallback to original value if not a number
            }
          } else {
            processedUpdates[key] = value
          }
        }

        const updatedShape = { ...shape, ...processedUpdates }
        await handleShapeUpdate(updatedShape)
      }

      toast.success(`Updated ${shapesToUpdate.length} shape${shapesToUpdate.length > 1 ? 's' : ''}`)
    },
    onShapesDeleted: async (command) => {
      // Find shapes to delete
      let shapesToDelete: Shape[] = []
      
      if (command.useSelected) {
        // Delete selected shapes
        shapesToDelete = Object.values(shapes).filter(s => s.lockedBy === userId)
      } else if (command.shapeName) {
        // Delete by name
        const shape = Object.values(shapes).find(s => s.name === command.shapeName)
        if (shape) {
          shapesToDelete = [shape]
        }
      } else if (command.shapeId) {
        // Delete by ID
        const shape = shapes[command.shapeId]
        if (shape) {
          shapesToDelete = [shape]
        }
      } else if (command.selector) {
        // Delete by selector (e.g., all circles)
        shapesToDelete = Object.values(shapes).filter(s => {
          if (command.selector?.type && s.type !== command.selector.type) return false
          // Add more selector logic here if needed
          return true
        })
      }
      
      if (shapesToDelete.length === 0) {
        toast.error('No shapes found to delete')
        return
      }
      
      // Delete each shape
      for (const shape of shapesToDelete) {
        await handleShapeDeleted(shape.id)
      }
      
      toast.success(`Deleted ${shapesToDelete.length} shape${shapesToDelete.length > 1 ? 's' : ''}`)
    },
    onError: (message) => {
      toast.error(message)
    }
  })
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

  // Handle batch locking for multi-select (prevents race conditions)
  const handleBatchShapeLock = useCallback(async (shapeIds: string[]) => {
    if (!userId || shapeIds.length === 0) return
    
    const shapesToLock: string[] = []
    
    // Check which shapes can be locked
    shapeIds.forEach(shapeId => {
      const shape = useShapeStore.getState().shapes[shapeId]
      // Don't steal locks from other users
      if (!shape?.lockedBy || shape.lockedBy === userId) {
        shapesToLock.push(shapeId)
      }
    })
    
    if (shapesToLock.length === 0) return
    
    try {
      // Optimistically update local state for all shapes
      shapesToLock.forEach(shapeId => lockShape(shapeId, userId))
      
      // Batch update Firestore in a single atomic operation
      await batchUpdateShapeFields(
        shapesToLock.map(shapeId => ({
          shapeId,
          fields: { lockedBy: userId }
        }))
      )
    } catch (error) {
      console.error('Failed to lock shapes in batch:', error)
      // Rollback optimistic updates on error
      shapesToLock.forEach(shapeId => unlockShape(shapeId))
    }
  }, [userId, lockShape, unlockShape])

  // Handle batch unlocking for multi-select (prevents race conditions)
  const handleBatchShapeUnlock = useCallback(async (shapeIds: string[]) => {
    if (!userId || shapeIds.length === 0) return
    
    const shapesToUnlock: string[] = []
    
    // Only unlock shapes we own
    shapeIds.forEach(shapeId => {
      const shape = useShapeStore.getState().shapes[shapeId]
      if (shape?.lockedBy === userId) {
        shapesToUnlock.push(shapeId)
      }
    })
    
    if (shapesToUnlock.length === 0) return
    
    // Debounce batch unlocks
    const now = Date.now()
    if (now - lastUnlockTime.current < UNLOCK_DEBOUNCE_MS) {
      return
    }
    lastUnlockTime.current = now
    
    try {
      // Optimistically update local state for all shapes
      shapesToUnlock.forEach(shapeId => unlockShape(shapeId))
      
      // Batch update Firestore in a single atomic operation
      await batchUpdateShapeFields(
        shapesToUnlock.map(shapeId => ({
          shapeId,
          fields: { lockedBy: null }
        }))
      )
    } catch (error) {
      console.error('Failed to unlock shapes in batch:', error)
      // Rollback: re-lock locally
      shapesToUnlock.forEach(shapeId => lockShape(shapeId, userId))
    }
  }, [userId, lockShape, unlockShape])

  const handleSignOut = async () => {
    await signOut()
  }

  // Handle AI command execution
  const handleAIExecute = useCallback(() => {
    if (!aiAgent.currentCommand.trim()) return
    
    // Build canvas context
    const canvasContext: CanvasContext = {
      shapes: Object.values(shapes).map(shape => ({
        ...shape,
        id: shape.id,
        type: shape.type,
        x: shape.x,
        y: shape.y
      })),
      canvasDimensions: {
        width: canvasRef.current?.clientWidth || 1920,
        height: canvasRef.current?.clientHeight || 1080
      },
      viewport: {
        x: 0, // TODO: Get from Canvas component if needed
        y: 0,
        scale: 1
      },
      selectedShapeIds: [] // TODO: Get from useShapeSelection if needed
    }
    
    aiAgent.execute(aiAgent.currentCommand, canvasContext)
  }, [aiAgent, shapes])

  // Show loading spinner until presence is initialized and color is assigned
  if (!isPresenceReady || color === '#000000') {
    return <LoadingSpinner message="Initializing workspace..." />
  }

  return (
    <div className="w-screen h-screen bg-canvas-bg flex flex-col">
      {/* Toast Notifications */}
      <Toaster position="top-right" />
      
      {/* Header */}
      <Header
        displayName={displayName}
        color={color}
        onlineUsers={onlineUsers}
        currentUserId={userId}
        onSignOut={handleSignOut}
      />

      {/* Canvas */}
      <div ref={canvasRef} className="flex-1 relative overflow-hidden">
        <Canvas
          tool={selectedTool}
          onToolChange={setSelectedTool}
          onCursorMove={handleCursorMove}
          onShapeCreated={handleShapeCreated}
          onShapeDeleted={handleShapeDeleted}
          onShapeUpdate={handleShapeUpdate}
          onShapeLock={handleShapeLock}
          onShapeUnlock={handleShapeUnlock}
          onBatchShapeLock={handleBatchShapeLock}
          onBatchShapeUnlock={handleBatchShapeUnlock}
          onDetailPaneVisibilityChange={setIsDetailPaneOpen}
          onToggleKeyboardShortcuts={() => setShowKeyboardShortcuts((prev) => !prev)}
        />
        
        {/* AI Command Input (above toolbar) */}
        {aiAgent.isOpen && (
          <AICommandInput
            isExecuting={aiAgent.isExecuting}
            currentCommand={aiAgent.currentCommand}
            onCommandChange={aiAgent.setCurrentCommand}
            onExecute={handleAIExecute}
            isDetailPaneOpen={isDetailPaneOpen}
          />
        )}
        
        {/* Toolbar */}
        <Toolbar 
          selectedTool={selectedTool} 
          onSelectTool={setSelectedTool}
          isAIAgentOpen={aiAgent.isOpen}
          onToggleAIAgent={aiAgent.toggle}
          onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        />
        
        {/* Keyboard Shortcuts Guide */}
        {showKeyboardShortcuts && (
          <KeyboardShortcutsGuide onClose={() => setShowKeyboardShortcuts(false)} />
        )}
      </div>
    </div>
  )
}

