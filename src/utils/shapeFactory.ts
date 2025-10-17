/**
 * Shape Factory - Centralized shape creation and manipulation
 * 
 * This module provides a unified interface for creating, updating, and managing
 * different shape types, eliminating duplication across the codebase.
 */

import { Shape, RectangleShape, CircleShape, LineShape, TextShape } from '../types'
import { generateUniqueShapeId } from './canvasUtils'

// ============================================================================
// Shape Name Generation
// ============================================================================

// Counters for auto-generating shape names
const shapeCounters: Record<string, number> = {
  rectangle: 0,
  circle: 0,
  line: 0,
  text: 0,
}

/**
 * Generate a unique name for a shape
 * @param type The shape type
 * @returns A unique name like "rectangle-1", "circle-2", etc.
 */
export function generateShapeName(type: string): string {
  shapeCounters[type] = (shapeCounters[type] || 0) + 1
  return `${type}-${shapeCounters[type]}`
}

// ============================================================================
// Shape Type Registry
// ============================================================================

export interface ShapeTypeConfig {
  /** Display name for the shape type */
  displayName: string
  /** Default properties for new shapes of this type */
  getDefaultProps: (x: number, y: number, userId: string) => Partial<Shape>
  /** Update properties during creation (drag) */
  updateCreationProps: (shape: Shape, mouseX: number, mouseY: number) => Partial<Shape>
  /** Get shape dimensions for manipulation */
  getDimensions: (shape: Shape) => { width: number; height: number }
  /** Get shape center position */
  getCenter: (shape: Shape) => { x: number; y: number }
  /** Get shape bounds for collision detection */
  getBounds: (shape: Shape) => { x: number; y: number; width: number; height: number }
  /** Format dimensions for display */
  formatDimensions: (shape: Shape) => string
  /** Check if shape has minimum size */
  hasMinimumSize: (shape: Shape, minSize: number) => boolean
  /** Normalize shape (fix negative dimensions) */
  normalize: (shape: Shape) => Shape
}

const shapeTypeRegistry: Record<string, ShapeTypeConfig> = {
  rectangle: {
    displayName: 'Rectangle',
    getDefaultProps: (x, y, userId) => ({
      type: 'rectangle',
      name: generateShapeName('rectangle'),
      x,
      y,
      width: 0,
      height: 0,
      color: '#D1D5DB',
      opacity: 1.0,
      zIndex: Date.now(), // Use timestamp for unique, increasing z-index
      createdBy: userId,
    }),
    updateCreationProps: (shape, mouseX, mouseY) => ({
      width: mouseX - shape.x,
      height: mouseY - shape.y,
    }),
    getDimensions: (shape) => {
      const rect = shape as RectangleShape
      return { width: rect.width, height: rect.height }
    },
    getCenter: (shape) => {
      const rect = shape as RectangleShape
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
    },
    getBounds: (shape) => {
      const rect = shape as RectangleShape
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    },
    formatDimensions: (shape) => {
      const rect = shape as RectangleShape
      return `${Math.round(rect.width)} × ${Math.round(rect.height)}`
    },
    hasMinimumSize: (shape, minSize) => {
      const rect = shape as RectangleShape
      return Math.abs(rect.width) > minSize && Math.abs(rect.height) > minSize
    },
    normalize: (shape) => {
      const rect = shape as RectangleShape
      return {
        ...rect,
        x: rect.width < 0 ? rect.x + rect.width : rect.x,
        y: rect.height < 0 ? rect.y + rect.height : rect.y,
        width: Math.abs(rect.width),
        height: Math.abs(rect.height),
      } as RectangleShape
    },
  },
  
  circle: {
    displayName: 'Circle',
    getDefaultProps: (x, y, userId) => ({
      type: 'circle',
      name: generateShapeName('circle'),
      x,
      y,
      radiusX: 0,
      radiusY: 0,
      color: '#D1D5DB',
      opacity: 1.0,
      zIndex: Date.now(),
      createdBy: userId,
    }),
    updateCreationProps: (shape, mouseX, mouseY) => {
      const width = mouseX - shape.x
      const height = mouseY - shape.y
      return {
        radiusX: width / 2,
        radiusY: height / 2,
      }
    },
    getDimensions: (shape) => {
      const circle = shape as CircleShape
      return { width: circle.radiusX * 2, height: circle.radiusY * 2 }
    },
    getCenter: (shape) => {
      const circle = shape as CircleShape
      return { x: circle.x + circle.radiusX, y: circle.y + circle.radiusY }
    },
    getBounds: (shape) => {
      const circle = shape as CircleShape
      return { 
        x: circle.x, 
        y: circle.y, 
        width: circle.radiusX * 2, 
        height: circle.radiusY * 2 
      }
    },
    formatDimensions: (shape) => {
      const circle = shape as CircleShape
      return `${Math.round(circle.radiusX)} × ${Math.round(circle.radiusY)}`
    },
    hasMinimumSize: (shape, minSize) => {
      const circle = shape as CircleShape
      return Math.abs(circle.radiusX) > minSize && Math.abs(circle.radiusY) > minSize
    },
    normalize: (shape) => {
      const circle = shape as CircleShape
      const width = circle.radiusX * 2
      const height = circle.radiusY * 2
      return {
        ...circle,
        x: width < 0 ? circle.x + width : circle.x,
        y: height < 0 ? circle.y + height : circle.y,
        radiusX: Math.abs(circle.radiusX),
        radiusY: Math.abs(circle.radiusY),
      } as CircleShape
    },
  },
  
  line: {
    displayName: 'Line',
    getDefaultProps: (x, y, userId) => ({
      type: 'line',
      name: generateShapeName('line'),
      x,
      y,
      x2: x,
      y2: y,
      strokeWidth: 4,
      color: '#D1D5DB',
      opacity: 1.0,
      zIndex: Date.now(),
      createdBy: userId,
    }),
    updateCreationProps: (_shape, mouseX, mouseY) => ({
      x2: mouseX,
      y2: mouseY,
    }),
    getDimensions: (shape) => {
      const line = shape as LineShape
      return { 
        width: Math.abs(line.x2 - line.x), 
        height: Math.abs(line.y2 - line.y) 
      }
    },
    getCenter: (shape) => {
      const line = shape as LineShape
      return { 
        x: (line.x + line.x2) / 2, 
        y: (line.y + line.y2) / 2 
      }
    },
    getBounds: (shape) => {
      const line = shape as LineShape
      const minX = Math.min(line.x, line.x2)
      const minY = Math.min(line.y, line.y2)
      const maxX = Math.max(line.x, line.x2)
      const maxY = Math.max(line.y, line.y2)
      return { 
        x: minX, 
        y: minY, 
        width: maxX - minX, 
        height: maxY - minY 
      }
    },
    formatDimensions: (shape) => {
      const line = shape as LineShape
      const length = Math.sqrt(Math.pow(line.x2 - line.x, 2) + Math.pow(line.y2 - line.y, 2))
      return `${Math.round(length)}px`
    },
    hasMinimumSize: (shape, minSize) => {
      const line = shape as LineShape
      const length = Math.sqrt(Math.pow(line.x2 - line.x, 2) + Math.pow(line.y2 - line.y, 2))
      return length > minSize
    },
    normalize: (shape) => {
      // For lines, we don't need to normalize - they can have any orientation
      return shape as LineShape
    },
  },
  
  text: {
    displayName: 'Text',
    getDefaultProps: (x, y, userId) => ({
      type: 'text',
      name: generateShapeName('text'),
      x,
      y,
      width: 0,
      height: 0,
      text: 'Text',
      fontSize: 16,
      fontFamily: 'Arial',
      textColor: '#000000',
      color: 'transparent',
      opacity: 1.0,
      zIndex: Date.now(),
      align: 'left' as const,
      verticalAlign: 'top' as const,
      createdBy: userId,
    }),
    updateCreationProps: (shape, mouseX, mouseY) => {
      return {
        width: mouseX - shape.x,
        height: mouseY - shape.y,
      }
    },
    getDimensions: (shape) => {
      const text = shape as TextShape
      return { width: text.width, height: text.height }
    },
    getCenter: (shape) => {
      const text = shape as TextShape
      return { 
        x: text.x + text.width / 2, 
        y: text.y + text.height / 2 
      }
    },
    getBounds: (shape) => {
      const text = shape as TextShape
      return { 
        x: text.x, 
        y: text.y, 
        width: text.width, 
        height: text.height 
      }
    },
    formatDimensions: (shape) => {
      const text = shape as TextShape
      return `${Math.round(text.width)} × ${Math.round(text.height)}`
    },
    hasMinimumSize: (shape, minSize) => {
      const text = shape as TextShape
      return Math.abs(text.width) > minSize && Math.abs(text.height) > minSize
    },
    normalize: (shape) => {
      const text = shape as TextShape
      return {
        ...text,
        x: text.width < 0 ? text.x + text.width : text.x,
        y: text.height < 0 ? text.y + text.height : text.y,
        width: Math.abs(text.width),
        height: Math.abs(text.height),
      } as TextShape
    },
  },
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Create a new shape of the specified type
 */
export function createShape(
  type: string, 
  x: number, 
  y: number, 
  userId: string
): Shape {
  const config = shapeTypeRegistry[type]
  if (!config) {
    throw new Error(`Unknown shape type: ${type}`)
  }
  
  const id = generateUniqueShapeId()
  const defaultProps = config.getDefaultProps(x, y, userId)
  
  // Create the shape with proper typing
  const shape = {
    id,
    ...defaultProps,
  }
  
  return shape as Shape
}

/**
 * Update shape properties during creation (drag)
 */
export function updateShapeCreation(
  shape: Shape, 
  mouseX: number, 
  mouseY: number
): Shape {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return shape
  }
  
  const updates = config.updateCreationProps(shape, mouseX, mouseY)
  const updatedShape = { ...shape, ...updates }
  return updatedShape as Shape
}

/**
 * Get shape dimensions for manipulation
 */
export function getShapeDimensions(shape: Shape): { width: number; height: number } {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return { width: 0, height: 0 }
  }
  return config.getDimensions(shape)
}

/**
 * Get shape center position
 */
export function getShapeCenter(shape: Shape): { x: number; y: number } {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return { x: shape.x, y: shape.y }
  }
  return config.getCenter(shape)
}

/**
 * Get shape bounds for collision detection
 */
export function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return { x: shape.x, y: shape.y, width: 0, height: 0 }
  }
  return config.getBounds(shape)
}

/**
 * Format shape dimensions for display
 */
export function formatShapeDimensions(shape: Shape): string {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return '0 × 0'
  }
  return config.formatDimensions(shape)
}

/**
 * Check if shape has minimum size
 */
export function hasShapeMinimumSize(shape: Shape, minSize: number): boolean {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return false
  }
  return config.hasMinimumSize(shape, minSize)
}

/**
 * Normalize shape (fix negative dimensions)
 */
export function normalizeShape(shape: Shape): Shape {
  const config = shapeTypeRegistry[shape.type]
  if (!config) {
    return shape
  }
  return config.normalize(shape)
}

/**
 * Get all supported shape types
 */
export function getSupportedShapeTypes(): string[] {
  return Object.keys(shapeTypeRegistry)
}

/**
 * Get shape type configuration
 */
export function getShapeTypeConfig(type: string): ShapeTypeConfig | null {
  return shapeTypeRegistry[type] || null
}
