/**
 * useShapeDragging Hook
 * 
 * Manages shape dragging interactions with collision avoidance for panning
 * Also handles Alt+drag duplication
 * 
 * Real-time updates: Writes to RTDB (throttled) during drag, Firestore on drag end
 */

import { useRef } from 'react'
import Konva from 'konva'
import { Shape, Cursor } from '../types'
import useShapeStore from '../stores/useShapeStore'
import { syncShapeToRTDB } from '../utils/firebaseShapes'
import { throttle, CURSOR_THROTTLE_MS } from '../utils/throttle'
import { generateUniqueShapeId } from '../utils/canvasUtils'

interface UseShapeDraggingProps {
  isPanning: boolean
  isAltPressed: React.MutableRefObject<boolean>
  updateShape: (id: string, updates: Partial<Shape>) => void
  onDragUpdate?: (id: string, updates: Partial<Shape>) => void
  onCursorMove?: (cursor: Cursor) => void
  onShapeCreated?: (shape: Shape) => void
  onDragEnd?: (shape: Shape) => void // Called on drag end to persist to Firestore
}

export function useShapeDragging({
  isPanning,
  isAltPressed,
  updateShape,
  onDragUpdate,
  onCursorMove,
  onShapeCreated,
  onDragEnd,
}: UseShapeDraggingProps) {
  const { addShape, shapes } = useShapeStore()
  
  // Throttled RTDB sync for real-time updates (50ms, same as cursor)
  const throttledRTDBSync = useRef<((shape: Shape) => void) | null>(null)
  if (!throttledRTDBSync.current) {
    throttledRTDBSync.current = throttle((shape: Shape) => {
      syncShapeToRTDB(shape)
    }, CURSOR_THROTTLE_MS)
  }
  
  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>, draggedShape: Shape) => {
    // Prevent shape drag if middle mouse button is being used for panning
    // Check both isPanning state AND the actual mouse button to handle timing issues
    if (isPanning || e.evt.button === 1) {
      e.target.stopDrag()
      return
    }
    
    // Check if Alt is pressed - create duplicate immediately, then drag original
    if (isAltPressed.current && draggedShape) {
      // Create duplicate at original position (before drag starts)
      const duplicateId = generateUniqueShapeId()
      const duplicate: Shape = {
        ...draggedShape,
        id: duplicateId,
        lockedBy: null,
      }
      
      // Add duplicate to store
      addShape(duplicate)
      
      // Save duplicate to Firestore
      onShapeCreated?.(duplicate)
      
      // Now let Konva drag the ORIGINAL shape normally
      // The duplicate stays at the original position
    }
  }

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    const node = e.target
    // Node x/y represents the center (due to offset), convert back to top-left
    const updates = {
      x: node.x() - shape.width / 2,
      y: node.y() - shape.height / 2,
    }
    
    // Update local Zustand store immediately (optimistic)
    updateShape(shape.id, updates)
    
    // Get the updated shape from store for RTDB sync
    const updatedShape = { ...shapes[shape.id], ...updates }
    
    // Sync to RTDB for real-time updates (throttled to 50ms)
    if (throttledRTDBSync.current) {
      throttledRTDBSync.current(updatedShape)
    }
    
    // Legacy: keep onDragUpdate for backward compatibility (can be removed later)
    onDragUpdate?.(shape.id, updates)
    
    // Update cursor position during drag
    const stage = e.target.getStage()
    if (stage && onCursorMove) {
      const pos = stage.getRelativePointerPosition()
      if (pos) {
        onCursorMove({ x: pos.x, y: pos.y })
      }
    }
  }

  const handleDragEnd = (shape: Shape) => {
    // Get final position from Zustand store
    const finalShape = shapes[shape.id]
    
    if (finalShape && onDragEnd) {
      // Persist final position to Firestore
      onDragEnd(finalShape)
    }
  }

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}

