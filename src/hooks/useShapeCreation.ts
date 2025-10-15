/**
 * useShapeCreation Hook
 * 
 * Manages the creation of new shapes via click-and-drag
 */

import { useState } from 'react'
import Konva from 'konva'
import { Shape } from '../types'
import { createShape, updateShapeCreation, hasShapeMinimumSize, normalizeShape } from '../utils/shapeFactory'
import { MIN_SHAPE_SIZE } from '../utils/canvasConstants'

interface UseShapeCreationProps {
  userId: string | null
  onShapeCreated: (shape: Shape) => void
  onToolChange: (tool: 'select' | 'rectangle' | 'circle' | 'line' | 'text') => void
  shapeType: 'rectangle' | 'circle' | 'line' | 'text'
}

export function useShapeCreation({
  userId,
  onShapeCreated,
  onToolChange,
  shapeType,
}: UseShapeCreationProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [newShape, setNewShape] = useState<Shape | null>(null)

  const startCreating = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getRelativePointerPosition()
    if (!pos || !userId) return

    // Create new shape using shape factory
    const shape = createShape(shapeType, pos.x, pos.y, userId)
    setNewShape(shape)
    setIsDrawing(true)
  }

  const updateSize = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !newShape) return

    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getRelativePointerPosition()
    if (!pos) return

    // Update shape using shape factory
    const updatedShape = updateShapeCreation(newShape, pos.x, pos.y)
    setNewShape(updatedShape)
  }

  const finishCreating = () => {
    if (isDrawing && newShape) {
      // Only add shape if it has meaningful size
      if (hasShapeMinimumSize(newShape, MIN_SHAPE_SIZE)) {
        // Normalize negative dimensions
        const normalized = normalizeShape(newShape)
        onShapeCreated(normalized)
        
        // Auto-switch back to select tool after creating shape
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

