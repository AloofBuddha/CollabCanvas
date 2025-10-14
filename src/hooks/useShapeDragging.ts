/**
 * useShapeDragging Hook
 * 
 * Manages shape dragging interactions with collision avoidance for panning
 */

import Konva from 'konva'
import { Shape } from '../types'

interface UseShapeDraggingProps {
  isPanning: boolean
  updateShape: (id: string, updates: Partial<Shape>) => void
  onDragUpdate?: (id: string, updates: Partial<Shape>) => void
}

export function useShapeDragging({
  isPanning,
  updateShape,
  onDragUpdate,
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
    const updates = {
      x: node.x(),
      y: node.y(),
    }
    updateShape(shape.id, updates)
    onDragUpdate?.(shape.id, updates)
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

