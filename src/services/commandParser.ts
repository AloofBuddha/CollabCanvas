/**
 * Command Parser
 * 
 * Converts AI-generated commands into canvas actions
 */

import { Command, CreateShapeCommand } from '../types/aiAgent'
import { Shape, CircleShape, RectangleShape, TextShape, LineShape } from '../types'
import { NEW_SHAPE_COLOR } from '../constants'
import { generateShapeName } from '../utils/shapeFactory'

/**
 * Generate a unique shape ID
 */
function generateShapeId(): string {
  return `shape-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

/**
 * Parse and execute a command, returning the shapes to create/update/delete
 * For now, only createShape returns shapes. update/delete will be handled differently
 */
export function parseCommand(command: Command, userId: string): Shape[] {
  console.log('🔧 parseCommand called with action:', command.action)
  switch (command.action) {
    case 'createShape':
      const shape = createShapeFromCommand(command, userId)
      console.log('🎨 Created shape from command:', shape)
      return [shape]
    case 'updateShape':
      // Will be handled by useAIAgent hook directly with shape store
      return []
    case 'deleteShape':
      // Will be handled by useAIAgent hook directly with shape store  
      return []
  }
}

/**
 * Create a shape from a CreateShapeCommand
 */
function createShapeFromCommand(command: CreateShapeCommand, userId: string): Shape {
  const { shape } = command
  const baseShape = {
    id: generateShapeId(),
    name: shape.name || generateShapeName(shape.type), // Use provided name or auto-generate
    createdBy: userId,
    rotation: shape.rotation || 0,
    opacity: shape.opacity ?? 1.0, // Default to fully opaque
    zIndex: Date.now(), // Use timestamp for layering
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
        color: shape.color || shape.fill || NEW_SHAPE_COLOR, // Prefer color, fallback to fill
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
        color: shape.color || shape.fill || NEW_SHAPE_COLOR, // Prefer color, fallback to fill
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
      }
      return rect
    }

    case 'text': {
      console.log('📝 Creating text shape from AI command:', {
        text: shape.text,
        textColor: shape.textColor,
        fill: shape.fill,
        align: shape.align,
        verticalAlign: shape.verticalAlign
      })
      
      const text: TextShape = {
        ...baseShape,
        type: 'text',
        x: shape.x,
        y: shape.y,
        text: shape.text || 'Text',
        fontSize: shape.fontSize || 16,
        fontFamily: shape.fontFamily || 'Arial',
        textColor: shape.textColor || '#000000', // Black text by default
        color: shape.color || shape.fill || 'transparent', // Prefer color, fallback to fill, default transparent
        width: shape.width || 200,
        height: shape.height || 50,
        align: shape.align || 'left',
        verticalAlign: shape.verticalAlign || 'top',
      }
      
      console.log('✅ Final text shape:', {
        text: text.text,
        textColor: text.textColor,
        color: text.color,
        align: text.align,
        verticalAlign: text.verticalAlign
      })
      
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
        color: shape.color || shape.stroke || NEW_SHAPE_COLOR, // Prefer color, fallback to stroke
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

