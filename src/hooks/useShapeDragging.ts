/**
 * useShapeDragging Hook
 * 
 * Manages shape dragging interactions with collision avoidance for panning
 * Also handles Alt+drag duplication
 */

import Konva from 'konva'
import { Shape, Cursor } from '../types'
import useShapeStore from '../stores/useShapeStore'

interface UseShapeDraggingProps {
  isPanning: boolean
  isAltPressed: React.MutableRefObject<boolean>
  updateShape: (id: string, updates: Partial<Shape>) => void
  onDragUpdate?: (id: string, updates: Partial<Shape>) => void
  onCursorMove?: (cursor: Cursor) => void
  onShapeCreated?: (shape: Shape) => void
}

export function useShapeDragging({
  isPanning,
  isAltPressed,
  updateShape,
  onDragUpdate,
  onCursorMove,
  onShapeCreated,
}: UseShapeDraggingProps) {
  const { addShape } = useShapeStore()
  
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
      const duplicateId = `shape-${Date.now()}-${Math.random()}`
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
    
    // Normal drag - always update the shape being dragged
    updateShape(shape.id, updates)
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

  const handleDragEnd = () => {
    // Drag completed - nothing special needed for duplication
    // The duplicate was already created on drag start
  }

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}

