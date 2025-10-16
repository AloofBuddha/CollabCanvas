/**
 * Command Parser Tests
 * 
 * Tests the parsing of AI commands into actual shape objects
 */

import { describe, it, expect } from 'vitest'
import { parseCommand } from '../../src/services/commandParser'
import { Command } from '../../src/types/aiAgent'
import { CircleShape, RectangleShape, TextShape, LineShape } from '../../src/types'

describe('Command Parser', () => {
  const userId = 'test-user-123'

  describe('Circle Shapes', () => {
    it('should parse a basic circle command', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200,
          radiusX: 50,
          radiusY: 50,
          fill: '#FF0000'
        }
      }

      const shapes = parseCommand(command, userId)

      expect(shapes).toHaveLength(1)
      const circle = shapes[0] as CircleShape
      expect(circle.type).toBe('circle')
      expect(circle.x).toBe(100)
      expect(circle.y).toBe(200)
      expect(circle.radiusX).toBe(50)
      expect(circle.radiusY).toBe(50)
      expect(circle.color).toBe('#FF0000')
      expect(circle.createdBy).toBe(userId)
      expect(circle.id).toBeDefined()
    })

    it('should apply default values for circle', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200
        }
      }

      const shapes = parseCommand(command, userId)
      const circle = shapes[0] as CircleShape

      expect(circle.radiusX).toBe(50)
      expect(circle.radiusY).toBe(50)
      expect(circle.color).toBe('#D1D5DB') // NEW_SHAPE_COLOR
    })

    it('should handle rotation for circle', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200,
          rotation: 45
        }
      }

      const shapes = parseCommand(command, userId)
      const circle = shapes[0] as CircleShape

      expect(circle.rotation).toBe(45)
    })

    it('should handle stroke properties for circle', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200,
          stroke: '#000000',
          strokeWidth: 2
        }
      }

      const shapes = parseCommand(command, userId)
      const circle = shapes[0] as CircleShape

      expect(circle.stroke).toBe('#000000')
      expect(circle.strokeWidth).toBe(2)
    })
  })

  describe('Rectangle Shapes', () => {
    it('should parse a basic rectangle command', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'rectangle',
          x: 300,
          y: 400,
          width: 200,
          height: 150,
          fill: '#0000FF'
        }
      }

      const shapes = parseCommand(command, userId)

      expect(shapes).toHaveLength(1)
      const rect = shapes[0] as RectangleShape
      expect(rect.type).toBe('rectangle')
      expect(rect.x).toBe(300)
      expect(rect.y).toBe(400)
      expect(rect.width).toBe(200)
      expect(rect.height).toBe(150)
      expect(rect.color).toBe('#0000FF')
    })

    it('should apply default values for rectangle', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'rectangle',
          x: 100,
          y: 200
        }
      }

      const shapes = parseCommand(command, userId)
      const rect = shapes[0] as RectangleShape

      expect(rect.width).toBe(100)
      expect(rect.height).toBe(100)
      expect(rect.color).toBe('#D1D5DB')
    })
  })

  describe('Text Shapes', () => {
    it('should parse a text command with all properties', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'text',
          x: 400,
          y: 100,
          text: 'Welcome',
          fontSize: 32,
          fontFamily: 'Comic Sans MS',
          textColor: '#FF0000',
          fill: 'transparent',
          align: 'center',
          verticalAlign: 'middle',
          rotation: 30
        }
      }

      const shapes = parseCommand(command, userId)

      expect(shapes).toHaveLength(1)
      const text = shapes[0] as TextShape
      expect(text.type).toBe('text')
      expect(text.text).toBe('Welcome')
      expect(text.fontSize).toBe(32)
      expect(text.fontFamily).toBe('Comic Sans MS')
      expect(text.textColor).toBe('#FF0000')
      expect(text.color).toBe('transparent')
      expect(text.align).toBe('center')
      expect(text.verticalAlign).toBe('middle')
      expect(text.rotation).toBe(30)
    })

    it('should apply default values for text', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'text',
          x: 100,
          y: 200,
          text: 'Hello'
        }
      }

      const shapes = parseCommand(command, userId)
      const text = shapes[0] as TextShape

      expect(text.fontSize).toBe(16)
      expect(text.fontFamily).toBe('Arial')
      expect(text.textColor).toBe('#000000') // Black text by default
      expect(text.color).toBe('transparent') // Transparent background by default
      expect(text.width).toBe(200)
      expect(text.height).toBe(50)
      expect(text.align).toBe('left')
      expect(text.verticalAlign).toBe('top')
    })

    it('should handle transparent fill correctly', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'text',
          x: 100,
          y: 200,
          text: 'Hello',
          fill: 'transparent'
        }
      }

      const shapes = parseCommand(command, userId)
      const text = shapes[0] as TextShape

      expect(text.color).toBe('transparent')
    })
  })

  describe('Line Shapes', () => {
    it('should parse a line command', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'line',
          x: 100,
          y: 100,
          x2: 200,
          y2: 200,
          stroke: '#FF0000',
          strokeWidth: 5
        }
      }

      const shapes = parseCommand(command, userId)

      expect(shapes).toHaveLength(1)
      const line = shapes[0] as LineShape
      expect(line.type).toBe('line')
      expect(line.x).toBe(100)
      expect(line.y).toBe(100)
      expect(line.x2).toBe(200)
      expect(line.y2).toBe(200)
      expect(line.color).toBe('#FF0000')
      expect(line.strokeWidth).toBe(5)
    })

    it('should apply default values for line', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'line',
          x: 100,
          y: 200
        }
      }

      const shapes = parseCommand(command, userId)
      const line = shapes[0] as LineShape

      expect(line.x2).toBe(200) // x + 100
      expect(line.y2).toBe(200) // y (horizontal line)
      expect(line.color).toBe('#D1D5DB')
      expect(line.strokeWidth).toBe(2)
    })
  })

  describe('Shape ID Generation', () => {
    it('should generate unique IDs for each shape', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200
        }
      }

      const shapes1 = parseCommand(command, userId)
      const shapes2 = parseCommand(command, userId)

      expect(shapes1[0].id).not.toBe(shapes2[0].id)
      expect(shapes1[0].id).toMatch(/^shape-\d+-\d+$/)
    })
  })

  describe('Created By Field', () => {
    it('should set createdBy to the provided userId', () => {
      const command: Command = {
        action: 'createShape',
        shape: {
          type: 'circle',
          x: 100,
          y: 200
        }
      }

      const shapes = parseCommand(command, 'user-abc-123')

      expect(shapes[0].createdBy).toBe('user-abc-123')
    })
  })
})

