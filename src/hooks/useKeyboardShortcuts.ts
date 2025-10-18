import { useEffect, useRef } from 'react'
import useShapeStore from '../stores/useShapeStore'
import useHistoryStore from '../stores/useHistoryStore'
import { Shape } from '../types'

/**
 * Global Keyboard Shortcuts Hook
 * 
 * Handles all keyboard shortcuts for the canvas:
 * - Ctrl/Cmd+Z: Undo
 * - Ctrl/Cmd+Shift+Z: Redo
 * - Arrow keys: Nudge selected shapes (1px or 10px with Shift)
 * - Ctrl/Cmd+D: Duplicate selected shapes
 * - Ctrl/Cmd+A: Select all shapes
 * - Escape: Deselect all shapes
 */

interface UseKeyboardShortcutsOptions {
  onUndo?: () => void
  onRedo?: () => void
  onDuplicate?: () => void
  onToggleHelp?: () => void
  onDeselectAll?: () => void // For clearing selection after undo/redo
  selectedShapeIds?: Set<string>
  onPersistShapes?: (shapes: Record<string, Shape>) => Promise<void> // Persist shapes to Firebase after undo/redo
  onPersistShape?: (shape: Shape) => void // Persist single shape after nudge
  disabled?: boolean
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { 
    onUndo, 
    onRedo, 
    onDuplicate, 
    onToggleHelp,
    onDeselectAll,
    selectedShapeIds = new Set(),
    onPersistShapes,
    onPersistShape,
    disabled = false 
  } = options
  
  // Store callbacks in refs to avoid re-registering event listener
  const callbacksRef = useRef({ onUndo, onRedo, onDuplicate, onToggleHelp, onDeselectAll, onPersistShapes, onPersistShape })
  useEffect(() => {
    callbacksRef.current = { onUndo, onRedo, onDuplicate, onToggleHelp, onDeselectAll, onPersistShapes, onPersistShape }
  }, [onUndo, onRedo, onDuplicate, onToggleHelp, onDeselectAll, onPersistShapes, onPersistShape])

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Get fresh state on each keypress
      const { shapes, updateShape, addShape } = useShapeStore.getState()
      const { pushState, undo, redo, canUndo, canRedo } = useHistoryStore.getState()
      const callbacks = callbacksRef.current
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey
      
      // Check if user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Undo (Ctrl/Cmd+Z)
      if (modKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (canUndo()) {
          e.preventDefault()
          const previousState = undo()
          if (previousState && callbacks.onPersistShapes) {
            // Deselect all shapes first to clear selection state
            callbacks.onDeselectAll?.()
            
            // Persist to Firebase - this will trigger listeners and update canvas
            callbacks.onPersistShapes(previousState).then(() => {
              callbacks.onUndo?.()
            }).catch(err => {
              console.error('Failed to persist undo state:', err)
              // Rollback on error
              redo()
            })
          }
        }
        return
      }

      // Redo (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)
      if (modKey && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')) {
        if (canRedo()) {
          e.preventDefault()
          const nextState = redo()
          if (nextState && callbacks.onPersistShapes) {
            // Deselect all shapes first to clear selection state
            callbacks.onDeselectAll?.()
            
            // Persist to Firebase - this will trigger listeners and update canvas
            callbacks.onPersistShapes(nextState).then(() => {
              callbacks.onRedo?.()
            }).catch(err => {
              console.error('Failed to persist redo state:', err)
              // Rollback on error
              undo()
            })
          }
        }
        return
      }

      // Duplicate (Ctrl/Cmd+D)
      if (modKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedShapeIds.size > 0) {
          // Push current state to history
          pushState(shapes)
          
          const newShapes: string[] = []
          selectedShapeIds.forEach((id) => {
            const shape = shapes[id]
            if (shape) {
              const newShape = {
                ...shape,
                id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                x: shape.x + 20, // Offset by 20px
                y: shape.y + 20,
                lockedBy: null, // Don't copy lock state
              }
              addShape(newShape)
              newShapes.push(newShape.id)
            }
          })
          
          callbacks.onDuplicate?.()
        }
        return
      }

      // Note: Select All (Ctrl/Cmd+A) and Deselect (Escape) are handled by useShapeSelection hook

      // Toggle Help (? or Shift+/)
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        callbacks.onToggleHelp?.()
        return
      }

      // Arrow key nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedShapeIds.size === 0) return
        
        e.preventDefault()
        
        // Push current state to history (only once per nudge operation)
        pushState(shapes)
        
        const nudgeDistance = e.shiftKey ? 10 : 1
        
        selectedShapeIds.forEach((id) => {
          const shape = shapes[id]
          if (!shape) return // Shape doesn't exist
          // Note: We allow nudging even if shape is locked by current user
          
          let updates: { x?: number; y?: number; x2?: number; y2?: number } = {}
          
          switch (e.key) {
            case 'ArrowUp':
              updates = { y: shape.y - nudgeDistance }
              // For lines, also move the end point
              if (shape.type === 'line') {
                updates.y2 = shape.y2 - nudgeDistance
              }
              break
            case 'ArrowDown':
              updates = { y: shape.y + nudgeDistance }
              // For lines, also move the end point
              if (shape.type === 'line') {
                updates.y2 = shape.y2 + nudgeDistance
              }
              break
            case 'ArrowLeft':
              updates = { x: shape.x - nudgeDistance }
              // For lines, also move the end point
              if (shape.type === 'line') {
                updates.x2 = shape.x2 - nudgeDistance
              }
              break
            case 'ArrowRight':
              updates = { x: shape.x + nudgeDistance }
              // For lines, also move the end point
              if (shape.type === 'line') {
                updates.x2 = shape.x2 + nudgeDistance
              }
              break
          }
          
          updateShape(id, updates)
          
          // Persist to Firebase so changes appear on canvas
          if (callbacks.onPersistShape) {
            const updatedShape = { ...shape, ...updates }
            callbacks.onPersistShape(updatedShape)
          }
        })
        
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, selectedShapeIds]) // Minimal dependencies - get fresh state via getState()

  return {
    canUndo: useHistoryStore.getState().canUndo(),
    canRedo: useHistoryStore.getState().canRedo(),
  }
}

