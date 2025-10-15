/**
 * Canvas Utility Functions
 * 
 * Helper functions for canvas operations
 */

import { Shape, RectangleShape, CircleShape } from '../types'

/**
 * Generate a unique shape ID
 * Uses timestamp + random integer to ensure uniqueness and RTDB compatibility
 * (RTDB paths cannot contain dots, so we use Math.floor instead of Math.random() directly)
 */
export function generateUniqueShapeId(): string {
  return `shape-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

/**
 * Normalize a shape's dimensions to ensure positive width/height (or radii for circles)
 * and adjust position accordingly
 */
export function normalizeShape(shape: Shape): Shape {
  if (shape.type === 'rectangle') {
    return {
      ...shape,
      x: shape.width < 0 ? shape.x + shape.width : shape.x,
      y: shape.height < 0 ? shape.y + shape.height : shape.y,
      width: Math.abs(shape.width),
      height: Math.abs(shape.height),
    } as RectangleShape
  } else if (shape.type === 'circle') {
    // For circles, normalize position based on negative radii
    // The x,y represents top-left of bounding box, but if we dragged up/left,
    // the radii will be negative and we need to adjust position
    const width = shape.radiusX * 2
    const height = shape.radiusY * 2
    
    return {
      ...shape,
      x: width < 0 ? shape.x + width : shape.x,
      y: height < 0 ? shape.y + height : shape.y,
      radiusX: Math.abs(shape.radiusX),
      radiusY: Math.abs(shape.radiusY),
    } as CircleShape
  }
  
  return shape
}

/**
 * Check if a shape has meaningful size for creation
 */
export function hasMinimumSize(shape: Shape, minSize: number): boolean {
  if (shape.type === 'rectangle') {
    return Math.abs(shape.width) > minSize && Math.abs(shape.height) > minSize
  } else if (shape.type === 'circle') {
    return Math.abs(shape.radiusX) > minSize && Math.abs(shape.radiusY) > minSize
  }
  return false
}

/**
 * Get cursor style based on tool and interaction state
 */
export function getCursorStyle(
  isPanning: boolean,
  isDrawing: boolean,
  tool: 'select' | 'rectangle' | 'circle' | 'line' | 'text'
): string {
  if (isPanning) return 'grabbing' // Middle-click panning
  if (isDrawing) return 'crosshair' // Creating shape
  if (tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'text') return 'crosshair' // Shape tool active
  return 'default' // Select tool - default pointer
}

