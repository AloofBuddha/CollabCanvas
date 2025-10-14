/**
 * useShapeCreation Hook
 * 
 * Manages the creation of new shapes via click-and-drag
 */

import { useState } from 'react'
import Konva from 'konva'
import { Shape } from '../types'
import { normalizeShape, hasMinimumSize } from '../utils/canvasUtils'
import { MIN_SHAPE_SIZE } from '../utils/canvasConstants'

interface UseShapeCreationProps {
  userId: string | null
  color: string
  onShapeCreated: (shape: Shape) => void
  onToolChange: (tool: 'select' | 'rectangle') => void
}

export function useShapeCreation({
  userId,
  color,
  onShapeCreated,
  onToolChange,
}: UseShapeCreationProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [newShape, setNewShape] = useState<Shape | null>(null)

  const startCreating = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getRelativePointerPosition()
    if (!pos) return

    // Start creating a new rectangle
    const id = `shape-${Date.now()}-${Math.random()}`
    const shape: Shape = {
      id,
      type: 'rectangle',
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      color: color,
      createdBy: userId!,
    }

    setNewShape(shape)
    setIsDrawing(true)
  }

  const updateSize = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !newShape) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getRelativePointerPosition()
    if (!pos) return

    // Update rectangle size
    const width = pos.x - newShape.x
    const height = pos.y - newShape.y

    setNewShape({
      ...newShape,
      width,
      height,
    })
  }

  const finishCreating = () => {
    if (isDrawing && newShape) {
      // Only add shape if it has meaningful size
      if (hasMinimumSize(newShape, MIN_SHAPE_SIZE)) {
        // Normalize negative dimensions
        const normalized = normalizeShape(newShape)
        onShapeCreated(normalized)
        
        // Auto-switch back to select tool after creating rectangle
        onToolChange('select')
      }

      setNewShape(null)
      setIsDrawing(false)
    }
  }

  const cancelCreating = () => {
    setNewShape(null)
    setIsDrawing(false)
  }

  return {
    isDrawing,
    newShape,
    startCreating,
    updateSize,
    finishCreating,
    cancelCreating,
  }
}

