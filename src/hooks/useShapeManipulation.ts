/**
 * useShapeManipulation Hook
 * 
 * Manages resize and rotation interactions for shapes.
 */

import { useState, useCallback } from 'react'
import Konva from 'konva'
import { Shape } from '../types'
import useShapeStore from '../stores/useShapeStore'
import { 
  ManipulationZone, 
  detectManipulationZone,
  calculateResize,
  calculateRotation,
  getPointerPosition
} from '../utils/shapeManipulation'

interface UseShapeManipulationProps {
  selectedShapeId: string | null
  updateShape: (id: string, updates: Partial<Shape>) => void
  onShapeUpdate?: (shape: Shape) => void
  stageRef: React.RefObject<Konva.Stage>
  stageScale: number
}

interface ManipulationState {
  isManipulating: boolean
  zone: ManipulationZone | null
  startMouseX: number
  startMouseY: number
  originalShape: Shape | null
  shapeId: string | null
}

export function useShapeManipulation({
  updateShape,
  onShapeUpdate,
  stageScale,
}: UseShapeManipulationProps) {
  const { shapes } = useShapeStore()
  
  const [manipulationState, setManipulationState] = useState<ManipulationState>({
    isManipulating: false,
    zone: null,
    startMouseX: 0,
    startMouseY: 0,
    originalShape: null,
    shapeId: null,
  })
  
  const [hoveredZone, setHoveredZone] = useState<ManipulationZone | null>(null)
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null)
  const [currentCursor, setCurrentCursor] = useState<string>('default')
  
  /**
   * Check which zone the mouse is hovering over (for any shape, including selected)
   */
  const handleShapeMouseMove = useCallback((
    e: Konva.KonvaEventObject<MouseEvent>,
    shape: Shape,
    isSelected: boolean
  ) => {
    if (!isSelected || manipulationState.isManipulating) return
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = getPointerPosition(stage)
    if (!pos) return
    
    const hit = detectManipulationZone(shape, pos.x, pos.y, stageScale)
    setHoveredZone(hit.zone)
    setHoveredShapeId(shape.id)
    setCurrentCursor(hit.cursor)
  }, [stageScale, manipulationState.isManipulating])
  
  /**
   * Check manipulation zones on stage mouse move (for rotation zones outside shape)
   */
  const handleStageMouseMove = useCallback((
    selectedShape: Shape | null,
    mouseX: number,
    mouseY: number
  ) => {
    if (!selectedShape || manipulationState.isManipulating) return
    
    const hit = detectManipulationZone(selectedShape, mouseX, mouseY, stageScale)
    setHoveredZone(hit.zone)
    setHoveredShapeId(selectedShape.id)
    setCurrentCursor(hit.cursor)
  }, [stageScale, manipulationState.isManipulating])
  
  /**
   * Clear hovered zone when mouse leaves shape
   */
  const handleShapeMouseLeave = useCallback(() => {
    if (!manipulationState.isManipulating) {
      setHoveredZone(null)
      setHoveredShapeId(null)
      setCurrentCursor('default')
    }
  }, [manipulationState.isManipulating])
  
  /**
   * Start manipulation (resize or rotate)
   */
  const startManipulation = useCallback((
    e: Konva.KonvaEventObject<MouseEvent>,
    shape: Shape,
    zone: ManipulationZone
  ) => {
    // Don't start manipulation for center zone (that's drag)
    if (zone === 'center') return false
    
    const stage = e.target.getStage()
    if (!stage) return false
    
    const pos = getPointerPosition(stage)
    if (!pos) return false
    
    // Prevent default drag behavior
    e.cancelBubble = true
    
    setManipulationState({
      isManipulating: true,
      zone,
      startMouseX: pos.x,
      startMouseY: pos.y,
      originalShape: { ...shape },
      shapeId: shape.id,
    })
    
    return true
  }, [])
  
  /**
   * Update manipulation during mouse move
   */
  const updateManipulation = useCallback((mouseX: number, mouseY: number, shape: Shape) => {
    if (!manipulationState.isManipulating || !manipulationState.originalShape) return
    
    const { zone, startMouseX, startMouseY, originalShape } = manipulationState
    
    if (!zone) return
    
    // Handle rotation
    if (zone.includes('rotate')) {
      const rotation = calculateRotation(
        originalShape, 
        mouseX, 
        mouseY, 
        startMouseX, 
        startMouseY, 
        originalShape.rotation || 0
      )
      updateShape(shape.id, { rotation })
    } 
    // Handle resize
    else {
      const updates = calculateResize(
        shape,
        zone,
        mouseX,
        mouseY,
        startMouseX,
        startMouseY,
        originalShape
      )
      updateShape(shape.id, updates)
    }
  }, [manipulationState, updateShape])
  
  /**
   * End manipulation and sync to Firestore
   */
  const endManipulation = useCallback(() => {
    if (!manipulationState.isManipulating || !manipulationState.shapeId) return
    
    // Get the current shape from the store (with latest updates)
    const currentShape = shapes[manipulationState.shapeId]
    if (currentShape) {
      // Sync final state to Firestore
      onShapeUpdate?.(currentShape)
    }
    
    setManipulationState({
      isManipulating: false,
      zone: null,
      startMouseX: 0,
      startMouseY: 0,
      originalShape: null,
      shapeId: null,
    })
  }, [manipulationState.isManipulating, manipulationState.shapeId, shapes, onShapeUpdate])
  
  /**
   * Get cursor style for current hover zone
   */
  const getManipulationCursor = useCallback((shapeId: string, isSelected: boolean): string => {
    if (!isSelected || shapeId !== hoveredShapeId) return 'move'
    
    if (manipulationState.isManipulating && manipulationState.zone) {
      // Return cursor for active manipulation
      const zone = manipulationState.zone
      if (zone.includes('rotate')) return 'grabbing'
      if (zone.includes('nw-corner') || zone.includes('se-corner')) return 'nwse-resize'
      if (zone.includes('ne-corner') || zone.includes('sw-corner')) return 'nesw-resize'
      if (zone.includes('n-edge') || zone.includes('s-edge')) return 'ns-resize'
      if (zone.includes('e-edge') || zone.includes('w-edge')) return 'ew-resize'
    }
    
    if (hoveredZone) {
      // Return cursor for hover
      if (hoveredZone.includes('rotate')) return 'grab'
      if (hoveredZone.includes('nw-corner') || hoveredZone.includes('se-corner')) return 'nwse-resize'
      if (hoveredZone.includes('ne-corner') || hoveredZone.includes('sw-corner')) return 'nesw-resize'
      if (hoveredZone.includes('n-edge') || hoveredZone.includes('s-edge')) return 'ns-resize'
      if (hoveredZone.includes('e-edge') || hoveredZone.includes('w-edge')) return 'ew-resize'
    }
    
    return 'move'
  }, [hoveredZone, hoveredShapeId, manipulationState])
  
  return {
    isManipulating: manipulationState.isManipulating,
    isRotating: manipulationState.isManipulating && manipulationState.zone?.includes('rotate') || false,
    hoveredZone,
    currentCursor,
    handleShapeMouseMove,
    handleStageMouseMove,
    handleShapeMouseLeave,
    startManipulation,
    updateManipulation,
    endManipulation,
    getManipulationCursor,
  }
}

