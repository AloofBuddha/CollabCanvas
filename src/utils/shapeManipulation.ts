/**
 * Shape Manipulation Utilities
 * 
 * Provides hit detection and calculation utilities for resizing and rotating shapes.
 */

import { Shape } from '../types'
import Konva from 'konva'

// Hit zone configuration
const CORNER_HIT_SIZE = 10 // Distance from corner to trigger resize
const EDGE_HIT_SIZE = 5 // Distance from edge to trigger resize
const ROTATION_ZONE_WIDTH = 30 // Width of rotation zone starting at corner edge (increased for easier targeting)
const MIN_SHAPE_SIZE = 5 // Minimum width/height (small value to allow flipping)

export type ManipulationZone = 
  | 'center' 
  | 'nw-corner' | 'ne-corner' | 'sw-corner' | 'se-corner'
  | 'n-edge' | 's-edge' | 'e-edge' | 'w-edge'
  | 'nw-rotate' | 'ne-rotate' | 'sw-rotate' | 'se-rotate'

export interface HitResult {
  zone: ManipulationZone
  cursor: string
}

/**
 * Detect which manipulation zone the mouse is over
 */
export function detectManipulationZone(
  shape: Shape,
  mouseX: number,
  mouseY: number,
  stageScale: number = 1
): HitResult {
  const { x, y, width, height, rotation = 0 } = shape
  
  // Adjust hit sizes for zoom level (constant size in screen space)
  const cornerSize = CORNER_HIT_SIZE / stageScale
  const edgeSize = EDGE_HIT_SIZE / stageScale
  
  // Calculate shape center
  const centerX = x + width / 2
  const centerY = y + height / 2
  
  // Transform mouse position to shape's local coordinate system
  // (inverse rotation transformation)
  const radians = -(rotation * Math.PI / 180)
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const localX = centerX + (dx * Math.cos(radians) - dy * Math.sin(radians))
  const localY = centerY + (dx * Math.sin(radians) + dy * Math.cos(radians))
  
  // Calculate distances from edges
  const distFromLeft = localX - x
  const distFromRight = (x + width) - localX
  const distFromTop = localY - y
  const distFromBottom = (y + height) - localY
  
  // Check rotation zones (outside corners with larger trigger area)
  const rotationZoneWidth = ROTATION_ZONE_WIDTH / stageScale
  const inNWRotation = distFromLeft < 0 && distFromLeft > -rotationZoneWidth && 
                        distFromTop < 0 && distFromTop > -rotationZoneWidth
  const inNERotation = distFromRight < 0 && distFromRight > -rotationZoneWidth && 
                        distFromTop < 0 && distFromTop > -rotationZoneWidth
  const inSWRotation = distFromLeft < 0 && distFromLeft > -rotationZoneWidth && 
                        distFromBottom < 0 && distFromBottom > -rotationZoneWidth
  const inSERotation = distFromRight < 0 && distFromRight > -rotationZoneWidth && 
                        distFromBottom < 0 && distFromBottom > -rotationZoneWidth
  
  if (inNWRotation || inNERotation || inSWRotation || inSERotation) {
    const zone: ManipulationZone = inNWRotation ? 'nw-rotate' : 
                                     inNERotation ? 'ne-rotate' :
                                     inSWRotation ? 'sw-rotate' : 'se-rotate'
    return { zone, cursor: 'grab' }
  }
  
  // Check if inside shape bounds
  const inBounds = distFromLeft >= 0 && distFromRight >= 0 && 
                   distFromTop >= 0 && distFromBottom >= 0
  
  if (!inBounds) {
    return { zone: 'center', cursor: 'default' }
  }
  
  // Check corners (priority over edges)
  if (distFromLeft <= cornerSize && distFromTop <= cornerSize) {
    return { zone: 'nw-corner', cursor: 'nwse-resize' }
  }
  if (distFromRight <= cornerSize && distFromTop <= cornerSize) {
    return { zone: 'ne-corner', cursor: 'nesw-resize' }
  }
  if (distFromLeft <= cornerSize && distFromBottom <= cornerSize) {
    return { zone: 'sw-corner', cursor: 'nesw-resize' }
  }
  if (distFromRight <= cornerSize && distFromBottom <= cornerSize) {
    return { zone: 'se-corner', cursor: 'nwse-resize' }
  }
  
  // Check edges
  if (distFromTop <= edgeSize) {
    return { zone: 'n-edge', cursor: 'ns-resize' }
  }
  if (distFromBottom <= edgeSize) {
    return { zone: 's-edge', cursor: 'ns-resize' }
  }
  if (distFromLeft <= edgeSize) {
    return { zone: 'w-edge', cursor: 'ew-resize' }
  }
  if (distFromRight <= edgeSize) {
    return { zone: 'e-edge', cursor: 'ew-resize' }
  }
  
  // Default to center (drag)
  return { zone: 'center', cursor: 'move' }
}

/**
 * Calculate new shape dimensions for resize operation
 * Supports smooth shape flipping when dragged past the starting point
 */
export function calculateResize(
  _shape: Shape,
  zone: ManipulationZone,
  mouseX: number,
  mouseY: number,
  _startMouseX: number,
  _startMouseY: number,
  originalShape: Shape
): Partial<Shape> {
  const { rotation = 0 } = originalShape
  const radians = -(rotation * Math.PI / 180)
  
  // Transform mouse position to local coordinates (accounting for rotation)
  const centerX = originalShape.x + originalShape.width / 2
  const centerY = originalShape.y + originalShape.height / 2
  const dx = mouseX - centerX
  const dy = mouseY - centerY
  const localMouseX = centerX + (dx * Math.cos(radians) - dy * Math.sin(radians))
  const localMouseY = centerY + (dx * Math.sin(radians) + dy * Math.cos(radians))
  
  // Define anchor points (opposite corners/edges that stay fixed)
  let anchorX: number
  let anchorY: number
  let useMouseX = false
  let useMouseY = false
  
  switch (zone) {
    case 'nw-corner':
      // Anchor at SE corner
      anchorX = originalShape.x + originalShape.width
      anchorY = originalShape.y + originalShape.height
      useMouseX = true
      useMouseY = true
      break
      
    case 'ne-corner':
      // Anchor at SW corner
      anchorX = originalShape.x
      anchorY = originalShape.y + originalShape.height
      useMouseX = true
      useMouseY = true
      break
      
    case 'sw-corner':
      // Anchor at NE corner
      anchorX = originalShape.x + originalShape.width
      anchorY = originalShape.y
      useMouseX = true
      useMouseY = true
      break
      
    case 'se-corner':
      // Anchor at NW corner
      anchorX = originalShape.x
      anchorY = originalShape.y
      useMouseX = true
      useMouseY = true
      break
      
    case 'n-edge':
      // Anchor at bottom edge
      anchorX = originalShape.x
      anchorY = originalShape.y + originalShape.height
      useMouseY = true
      break
      
    case 's-edge':
      // Anchor at top edge
      anchorX = originalShape.x
      anchorY = originalShape.y
      useMouseY = true
      break
      
    case 'w-edge':
      // Anchor at right edge
      anchorX = originalShape.x + originalShape.width
      anchorY = originalShape.y
      useMouseX = true
      break
      
    case 'e-edge':
      // Anchor at left edge
      anchorX = originalShape.x
      anchorY = originalShape.y
      useMouseX = true
      break
      
    default:
      // Center - no resize
      return {}
  }
  
  // Calculate new dimensions based on mouse position relative to anchor
  // This automatically handles flipping when mouse goes past anchor
  let newX = originalShape.x
  let newY = originalShape.y
  let newWidth = originalShape.width
  let newHeight = originalShape.height
  
  if (useMouseX) {
    newX = Math.min(localMouseX, anchorX)
    newWidth = Math.max(MIN_SHAPE_SIZE, Math.abs(localMouseX - anchorX))
  }
  
  if (useMouseY) {
    newY = Math.min(localMouseY, anchorY)
    newHeight = Math.max(MIN_SHAPE_SIZE, Math.abs(localMouseY - anchorY))
  }
  
  // Apply rotation transformation to position changes
  if (rotation !== 0) {
    const newCenterX = newX + newWidth / 2
    const newCenterY = newY + newHeight / 2
    
    const dcx = newCenterX - centerX
    const dcy = newCenterY - centerY
    
    const forwardRadians = rotation * Math.PI / 180
    const rotatedDcx = dcx * Math.cos(forwardRadians) - dcy * Math.sin(forwardRadians)
    const rotatedDcy = dcx * Math.sin(forwardRadians) + dcy * Math.cos(forwardRadians)
    
    newX = centerX + rotatedDcx - newWidth / 2
    newY = centerY + rotatedDcy - newHeight / 2
  }
  
  return { x: newX, y: newY, width: newWidth, height: newHeight }
}

/**
 * Calculate new rotation angle relative to initial mouse position
 */
export function calculateRotation(
  shape: Shape,
  mouseX: number,
  mouseY: number,
  startMouseX: number,
  startMouseY: number,
  initialRotation: number = 0
): number {
  const centerX = shape.x + shape.width / 2
  const centerY = shape.y + shape.height / 2
  
  // Calculate angle from center to current mouse position
  const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX)
  
  // Calculate angle from center to start mouse position
  const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX)
  
  // Calculate the rotation delta
  const deltaAngle = currentAngle - startAngle
  
  // Convert to degrees and add to initial rotation
  const deltaDegrees = deltaAngle * 180 / Math.PI
  const newRotation = initialRotation + deltaDegrees
  
  return newRotation
}

/**
 * Get the pointer position relative to the stage
 */
export function getPointerPosition(stage: Konva.Stage): { x: number, y: number } | null {
  const pointerPos = stage.getPointerPosition()
  if (!pointerPos) return null
  
  const transform = stage.getAbsoluteTransform().copy().invert()
  return transform.point(pointerPos)
}

