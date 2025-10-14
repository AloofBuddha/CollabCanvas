/**
 * useShapeDragging Hook
 * 
 * Manages shape dragging interactions with collision avoidance for panning
 */

import Konva from 'konva'
import { Shape, Cursor } from '../types'

interface UseShapeDraggingProps {
  isPanning: boolean
  updateShape: (id: string, updates: Partial<Shape>) => void
  onDragUpdate?: (id: string, updates: Partial<Shape>) => void
  onCursorMove?: (cursor: Cursor) => void
}

export function useShapeDragging({
  isPanning,
  updateShape,
  onDragUpdate,
  onCursorMove,
}: UseShapeDraggingProps) {
  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Prevent shape drag if middle mouse button is being used for panning
    // Check both isPanning state AND the actual mouse button to handle timing issues
    if (isPanning || e.evt.button === 1) {
      e.target.stopDrag()
      return
    }
  }

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    const node = e.target
    // Node x/y represents the center (due to offset), convert back to top-left
    const updates = {
      x: node.x() - shape.width / 2,
      y: node.y() - shape.height / 2,
    }
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
    // Drag completed
  }

  return {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}

