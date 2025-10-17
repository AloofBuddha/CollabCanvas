/**
 * useShapeSelection Hook
 * 
 * Manages shape selection state (including multi-select with drag-to-select)
 * and keyboard operations (delete, deselect)
 */

import { useState, useEffect, useRef } from 'react'
import Konva from 'konva'
import { Shape } from '../types'

interface UseShapeSelectionProps {
  onDelete?: (shapeIds: string[]) => void
  onDeselect?: (shapeId: string) => void
  onDeselectAll?: () => void
  onToolChange?: (tool: 'select') => void
  tool: 'select' | 'rectangle' | 'circle' | 'line' | 'text'
  userId?: string | null // Current user's ID to check for locked shapes
}

export interface SelectionBox {
  x: number
  y: number
  width: number
  height: number
}

export function useShapeSelection({ onDelete, onDeselect, onDeselectAll, onToolChange, tool, userId }: UseShapeSelectionProps) {
  const [selectedShapeIds, setSelectedShapeIds] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const selectionStartPos = useRef<{ x: number; y: number } | null>(null)

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

      // Escape key - deselect all shapes first, then switch to select tool
      if (e.key === 'Escape') {
        e.preventDefault()
        
        // Priority 1: If any shapes are selected, deselect all
        if (selectedShapeIds.size > 0) {
          onDeselectAll?.()
          setSelectedShapeIds(new Set())
          return
        }
        
        // Priority 2: If not in select mode, switch to select tool
        if (tool !== 'select') {
          onToolChange?.('select')
          return
        }
      }

      // Delete or Backspace key - delete all selected shapes (only if not editing text)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeIds.size > 0 && tool === 'select' && !isEditingText) {
        e.preventDefault()
        const ids = Array.from(selectedShapeIds)
        onDelete?.(ids)
        setSelectedShapeIds(new Set())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedShapeIds, onDelete, onDeselectAll, onToolChange, tool])

  const handleShapeClick = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    const evt = e.evt
    
    // Middle mouse button - don't select (used for panning)
    if (evt.button === 1) {
      return
    }
    
    // Left mouse button with select tool
    if (evt.button === 0 && tool === 'select') {
      // Shift+click: Add/remove from selection (multi-select mode)
      if (evt.shiftKey) {
        const newSelection = new Set(selectedShapeIds)
        
        if (newSelection.has(shapeId)) {
          // Toggle off: remove from selection
          newSelection.delete(shapeId)
          onDeselect?.(shapeId)
        } else {
          // Toggle on: add to selection
          newSelection.add(shapeId)
          // Note: locking is handled in Canvas.tsx
        }
        
        setSelectedShapeIds(newSelection)
      } else {
        // Regular click: select single shape (clear multi-select)
        // Deselect previous shapes if switching from multi-select to single select
        if (selectedShapeIds.size > 1) {
          onDeselectAll?.()
        } else if (selectedShapeIds.size === 1 && !selectedShapeIds.has(shapeId)) {
          // Deselect the old shape if switching to a new shape
          const oldId = Array.from(selectedShapeIds)[0]
          onDeselect?.(oldId)
        }
        
        setSelectedShapeIds(new Set([shapeId]))
      }
    }
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if we clicked on the stage itself (not on a shape)
    if (e.target === e.target.getStage()) {
      if (selectedShapeIds.size > 0) {
        onDeselectAll?.()
        setSelectedShapeIds(new Set())
      }
    }
  }

  // Start drag-to-select box
  const startSelection = (x: number, y: number) => {
    selectionStartPos.current = { x, y }
    setIsSelecting(true)
    setSelectionBox({ x, y, width: 0, height: 0 })
  }

  // Update drag-to-select box
  const updateSelection = (x: number, y: number) => {
    if (!selectionStartPos.current || !isSelecting) return

    const startX = selectionStartPos.current.x
    const startY = selectionStartPos.current.y

    // Calculate box dimensions (handle dragging in any direction)
    const minX = Math.min(startX, x)
    const minY = Math.min(startY, y)
    const maxX = Math.max(startX, x)
    const maxY = Math.max(startY, y)

    setSelectionBox({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    })
  }

  // Finish drag-to-select and determine selected shapes
  // Returns the set of newly selected shape IDs for immediate use (e.g., locking)
  const finishSelection = (shapes: Map<string, Shape>): Set<string> => {
    if (!selectionBox || !isSelecting) return new Set()

    const selected = new Set<string>()
    let hasLockedShapes = false

    // Check which shapes overlap with selection box
    shapes.forEach((shape, id) => {
      if (doesShapeOverlap(shape, selectionBox)) {
        // Check if shape is locked by another user
        // If no userId (not logged in), treat all locked shapes as locked by others
        if (shape.lockedBy && (!userId || shape.lockedBy !== userId)) {
          hasLockedShapes = true
        } else {
          selected.add(id)
        }
      }
    })

    // If any shape in the selection box is locked by another user, abort multi-select
    if (hasLockedShapes) {
      // Clear selection box and abort
      setIsSelecting(false)
      setSelectionBox(null)
      selectionStartPos.current = null
      return new Set()
    }

    // If we selected shapes, handle transition from old to new selection
    if (selected.size > 0) {
      // Only deselect shapes that are NOT in the new selection
      if (selectedShapeIds.size > 0) {
        const shapesToDeselect: string[] = []
        selectedShapeIds.forEach(id => {
          if (!selected.has(id)) {
            shapesToDeselect.push(id)
          }
        })
        
        // Unlock only the shapes that are no longer selected
        if (shapesToDeselect.length > 0) {
          shapesToDeselect.forEach(id => onDeselect?.(id))
        }
      }
      setSelectedShapeIds(selected)
    } else {
      // Clicked empty space with no shapes in box - deselect all
      if (selectedShapeIds.size > 0) {
        onDeselectAll?.()
        setSelectedShapeIds(new Set())
      }
    }

    // Clear selection box
    setIsSelecting(false)
    setSelectionBox(null)
    selectionStartPos.current = null
    
    // Return the newly selected IDs for immediate use
    return selected
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const selectShape = (shapeId: string) => {
    if (selectedShapeIds.size > 0) {
      onDeselectAll?.()
    }
    setSelectedShapeIds(new Set([shapeId]))
  }

  return {
    selectedShapeIds,
    selectedShapeId: selectedShapeIds.size === 1 ? Array.from(selectedShapeIds)[0] : null, // For backward compatibility
    isDragging,
    isSelecting,
    selectionBox,
    handleShapeClick,
    handleStageClick,
    handleDragStart,
    handleDragEnd,
    selectShape,
    startSelection,
    updateSelection,
    finishSelection,
  }
}

// Helper function to check if a shape overlaps with the selection box
// Uses AABB collision for partial overlap detection
function doesShapeOverlap(shape: Shape, box: SelectionBox): boolean {
  const boxLeft = box.x
  const boxTop = box.y
  const boxRight = box.x + box.width
  const boxBottom = box.y + box.height

  // For lines, check if either endpoint or the line itself intersects the box
  if (shape.type === 'line') {
    const x1 = shape.x
    const y1 = shape.y
    const x2 = shape.x2
    const y2 = shape.y2
    
    // Check if either endpoint is in the box
    const point1InBox = x1 >= boxLeft && x1 <= boxRight && y1 >= boxTop && y1 <= boxBottom
    const point2InBox = x2 >= boxLeft && x2 <= boxRight && y2 >= boxTop && y2 <= boxBottom
    if (point1InBox || point2InBox) return true
    
    // Check if line intersects box edges (simple AABB check)
    const lineLeft = Math.min(x1, x2)
    const lineRight = Math.max(x1, x2)
    const lineTop = Math.min(y1, y2)
    const lineBottom = Math.max(y1, y2)
    
    return !(
      lineRight < boxLeft ||
      lineLeft > boxRight ||
      lineBottom < boxTop ||
      lineTop > boxBottom
    )
  }

  // For rotated shapes, calculate the bounding box after rotation
  if (shape.rotation && shape.rotation !== 0) {
    const corners = getRotatedShapeCorners(shape)
    
    // Get the AABB of the rotated shape
    let shapeLeft = Infinity
    let shapeRight = -Infinity
    let shapeTop = Infinity
    let shapeBottom = -Infinity
    
    corners.forEach(corner => {
      shapeLeft = Math.min(shapeLeft, corner.x)
      shapeRight = Math.max(shapeRight, corner.x)
      shapeTop = Math.min(shapeTop, corner.y)
      shapeBottom = Math.max(shapeBottom, corner.y)
    })
    
    // Check AABB overlap
    return !(
      shapeRight < boxLeft ||
      shapeLeft > boxRight ||
      shapeBottom < boxTop ||
      shapeTop > boxBottom
    )
  }

  // Non-rotated shapes: simple AABB
  const shapeLeft = shape.x
  const shapeTop = shape.y
  let shapeRight: number
  let shapeBottom: number

  switch (shape.type) {
    case 'rectangle':
      shapeRight = shape.x + shape.width
      shapeBottom = shape.y + shape.height
      break
    case 'circle':
      shapeRight = shape.x + shape.radiusX * 2
      shapeBottom = shape.y + shape.radiusY * 2
      break
    case 'text':
      shapeRight = shape.x + (shape.width || 200)
      shapeBottom = shape.y + 50
      break
    default:
      return false
  }

  // Check AABB overlap
  return !(
    shapeRight < boxLeft ||
    shapeLeft > boxRight ||
    shapeBottom < boxTop ||
    shapeTop > boxBottom
  )
}

// Get the corners of a rotated shape for overlap detection
function getRotatedShapeCorners(shape: Shape): Array<{ x: number; y: number }> {
  let width = 0
  let height = 0
  let centerX = shape.x
  let centerY = shape.y

  switch (shape.type) {
    case 'rectangle':
      width = shape.width
      height = shape.height
      centerX = shape.x + width / 2
      centerY = shape.y + height / 2
      break
    case 'circle':
      width = shape.radiusX * 2
      height = shape.radiusY * 2
      centerX = shape.x + shape.radiusX
      centerY = shape.y + shape.radiusY
      break
    case 'text':
      width = shape.width || 200
      height = 50
      centerX = shape.x + width / 2
      centerY = shape.y + height / 2
      break
    default:
      return [{ x: shape.x, y: shape.y }]
  }

  const rotation = (shape.rotation || 0) * Math.PI / 180
  const halfWidth = width / 2
  const halfHeight = height / 2

  // Calculate the four corners relative to center, then rotate
  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ]

  return corners.map(corner => ({
    x: centerX + corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation),
    y: centerY + corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation),
  }))
}
