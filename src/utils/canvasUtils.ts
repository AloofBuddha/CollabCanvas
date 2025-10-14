/**
 * Canvas Utility Functions
 * 
 * Helper functions for canvas operations
 */

import { Shape } from '../types'

/**
 * Normalize a shape's dimensions to ensure positive width/height
 * and adjust position accordingly
 */
export function normalizeShape(shape: Shape): Shape {
  return {
    ...shape,
    x: shape.width < 0 ? shape.x + shape.width : shape.x,
    y: shape.height < 0 ? shape.y + shape.height : shape.y,
    width: Math.abs(shape.width),
    height: Math.abs(shape.height),
  }
}

/**
 * Check if a shape has meaningful size for creation
 */
export function hasMinimumSize(shape: Shape, minSize: number): boolean {
  return Math.abs(shape.width) > minSize && Math.abs(shape.height) > minSize
}

/**
 * Get cursor style based on tool and interaction state
 */
export function getCursorStyle(
  isPanning: boolean,
  isDrawing: boolean,
  tool: 'select' | 'rectangle'
): string {
  if (isPanning) return 'grabbing' // Middle-click panning
  if (isDrawing) return 'crosshair' // Creating rectangle
  if (tool === 'rectangle') return 'crosshair' // Rectangle tool active
  return 'default' // Select tool - default pointer
}

