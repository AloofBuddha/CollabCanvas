/**
 * Command Parser
 * 
 * Converts AI-generated commands into canvas actions
 */

import { Command, CreateShapeCommand } from '../types/aiAgent'
import { Shape, CircleShape, RectangleShape, TextShape, LineShape } from '../types'
import { NEW_SHAPE_COLOR } from '../constants'

/**
 * Generate a unique shape ID
 */
function generateShapeId(): string {
  return `shape-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

/**
 * Parse and execute a command, returning the shapes to create
 */
export function parseCommand(command: Command, userId: string): Shape[] {
  switch (command.action) {
    case 'createShape':
      return [createShapeFromCommand(command, userId)]
  }
}

/**
 * Create a shape from a CreateShapeCommand
 */
function createShapeFromCommand(command: CreateShapeCommand, userId: string): Shape {
  const { shape } = command
  const baseShape = {
    id: generateShapeId(),
    createdBy: userId,
    rotation: shape.rotation || 0,
  }

  switch (shape.type) {
    case 'circle': {
      const circle: CircleShape = {
        ...baseShape,
        type: 'circle',
        x: shape.x,
        y: shape.y,
        radiusX: shape.radiusX || 50,
        radiusY: shape.radiusY || 50,
        color: shape.fill || NEW_SHAPE_COLOR,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
      }
      return circle
    }

    case 'rectangle': {
      const rect: RectangleShape = {
        ...baseShape,
        type: 'rectangle',
        x: shape.x,
        y: shape.y,
        width: shape.width || 100,
        height: shape.height || 100,
        color: shape.fill || NEW_SHAPE_COLOR,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
      }
      return rect
    }

    case 'text': {
      const text: TextShape = {
        ...baseShape,
        type: 'text',
        x: shape.x,
        y: shape.y,
        text: shape.text || 'Text',
        fontSize: shape.fontSize || 16,
        fontFamily: shape.fontFamily || 'Arial',
        textColor: shape.textColor || '#000000', // Black text by default
        color: shape.fill === 'transparent' ? 'transparent' : (shape.fill || 'transparent'), // Transparent background by default
        width: shape.width || 200,
        height: shape.height || 50,
        align: shape.align || 'left',
        verticalAlign: shape.verticalAlign || 'top',
      }
      return text
    }

    case 'line': {
      const line: LineShape = {
        ...baseShape,
        type: 'line',
        x: shape.x,
        y: shape.y,
        x2: shape.x2 || shape.x + 100,
        y2: shape.y2 || shape.y,
        color: shape.stroke || NEW_SHAPE_COLOR,
        strokeWidth: shape.strokeWidth || 2,
      }
      return line
    }

    default: {
      const exhaustiveCheck: never = shape.type
      throw new Error(`Unknown shape type: ${exhaustiveCheck}`)
    }
  }
}

