/**
 * useShapeSelection Hook
 * 
 * Manages shape selection state and keyboard deletion
 */

import { useState, useEffect } from 'react'
import Konva from 'konva'

interface UseShapeSelectionProps {
  onDelete?: (shapeId: string) => void
  onDeselect?: (shapeId: string) => void
  onToolChange?: (tool: 'select') => void
  tool: 'select' | 'rectangle' | 'circle' | 'line' | 'text'
}

export function useShapeSelection({ onDelete, onDeselect, onToolChange, tool }: UseShapeSelectionProps) {
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Handle keyboard events for deletion and deselection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is currently editing in an input field
      const activeElement = document.activeElement
      const isEditingText = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT'
      )

      // Escape key - deselect shape first, then switch to select tool
      if (e.key === 'Escape') {
        e.preventDefault()
        
        // Priority 1: If a shape is selected, deselect it
        if (selectedShapeId) {
          onDeselect?.(selectedShapeId)
          setSelectedShapeId(null)
          return
        }
        
        // Priority 2: If not in select mode, switch to select tool
        if (tool !== 'select') {
          onToolChange?.('select')
          return
        }
      }

      // Delete or Backspace key - only if not editing text
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId && tool === 'select' && !isEditingText) {
        e.preventDefault()
        onDelete?.(selectedShapeId)
        setSelectedShapeId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedShapeId, onDelete, onDeselect, onToolChange, tool])

  const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    const evt = e.evt
    
    // Middle mouse button - don't select (used for panning)
    if (evt.button === 1) {
      return
    }
    
    // Left mouse button with select tool - select shape
    if (evt.button === 0 && tool === 'select') {
      setSelectedShapeId(shapeId)
    }
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if we clicked on the stage itself (not on a shape)
    if (e.target === e.target.getStage()) {
      setSelectedShapeId(null)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const selectShape = (shapeId: string) => {
    setSelectedShapeId(shapeId)
  }

  return {
    selectedShapeId,
    isDragging,
    handleShapeClick,
    handleStageClick,
    handleDragStart: handleDragStart,
    handleDragEnd: handleDragEnd,
    selectShape,
  }
}

