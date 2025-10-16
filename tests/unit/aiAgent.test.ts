/**
 * AI Agent Service Tests
 * 
 * Tests the AI agent's command parsing, error handling, and response validation
 * without making actual API calls to OpenAI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeCommand } from '../../src/services/aiAgent'
import { CanvasContext } from '../../src/types/aiAgent'

// Create a mock invoke function that we can control
const mockInvoke = vi.fn()

// Mock LangChain modules
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke
  }))
}))

vi.mock('@langchain/core/messages', () => ({
  HumanMessage: vi.fn((content) => content),
  SystemMessage: vi.fn((content) => content)
}))

describe('AI Agent Service', () => {
  let mockContext: CanvasContext

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockInvoke.mockReset()

    // Create mock context
    mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }
    
    // Set default API key for tests
    vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key')
  })

  describe('Single Command Responses', () => {
    it('should parse a single createShape command', async () => {
      const mockResponse = {
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

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('create a red circle at 100, 200', mockContext)

      expect(result).toEqual(mockResponse)
    })

    it('should parse a single createShape command with code blocks', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: {
          type: 'rectangle',
          x: 300,
          y: 400,
          width: 100,
          height: 100,
          fill: '#0000FF'
        }
      }

      mockInvoke.mockResolvedValue({
        content: '```json\n' + JSON.stringify(mockResponse) + '\n```'
      })

      const result = await executeCommand('create a blue rectangle', mockContext)

      expect(result).toEqual(mockResponse)
    })
  })

  describe('Multiple Command Responses', () => {
    it('should parse an array of createShape commands', async () => {
      const mockResponse = [
        {
          action: 'createShape',
          shape: {
            type: 'circle',
            x: 400,
            y: 300,
            radiusX: 80,
            radiusY: 80,
            fill: '#FFFF00'
          }
        },
        {
          action: 'createShape',
          shape: {
            type: 'circle',
            x: 370,
            y: 280,
            radiusX: 8,
            radiusY: 8,
            fill: '#000000'
          }
        }
      ]

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('make a smiley face', mockContext)

      expect(Array.isArray(result)).toBe(true)
      if (Array.isArray(result)) {
        expect(result).toHaveLength(2)
        expect(result[0].shape.type).toBe('circle')
        expect(result[1].shape.type).toBe('circle')
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle AI error responses gracefully', async () => {
      const mockErrorResponse = {
        action: 'error',
        message: 'Creating a dog out of lines is not a supported command. Please specify shapes and their properties.'
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockErrorResponse)
      })

      await expect(
        executeCommand('make a dog out of lines', mockContext)
      ).rejects.toThrow('Creating a dog out of lines is not a supported command')
    })

    it('should handle generic error field', async () => {
      const mockErrorResponse = {
        error: 'Something went wrong'
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockErrorResponse)
      })

      await expect(
        executeCommand('invalid command', mockContext)
      ).rejects.toThrow('Something went wrong')
    })

    it('should handle invalid JSON', async () => {
      mockInvoke.mockResolvedValue({
        content: 'This is not JSON'
      })

      await expect(
        executeCommand('create something', mockContext)
      ).rejects.toThrow()
    })

    it('should provide user-friendly message for Zod validation errors', async () => {
      // Return a response that doesn't match the schema
      const invalidResponse = {
        action: 'unknownAction',
        data: 'invalid'
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(invalidResponse)
      })

      await expect(
        executeCommand('create something', mockContext)
      ).rejects.toThrow('AI response format was invalid. Please try rephrasing your command.')
    })

    it('should handle missing API key', async () => {
      // Mock missing API key
      vi.stubEnv('VITE_OPENAI_API_KEY', '')

      await expect(
        executeCommand('create a circle', mockContext)
      ).rejects.toThrow('VITE_OPENAI_API_KEY is not set')
    })
  })

  describe('Shape Properties', () => {
    it('should parse shapes with rotation', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: {
          type: 'rectangle',
          x: 300,
          y: 400,
          width: 100,
          height: 100,
          fill: '#0000FF',
          rotation: 45
        }
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('create a rotated rectangle', mockContext)

      if (!Array.isArray(result)) {
        expect(result.shape.rotation).toBe(45)
      }
    })

    it('should parse text shapes with all properties', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: {
          type: 'text',
          x: 400,
          y: 100,
          text: 'Welcome',
          fontSize: 32,
          fontFamily: 'Comic Sans MS',
          textColor: '#000000',
          fill: 'transparent',
          align: 'center'
        }
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('create centered text', mockContext)

      if (!Array.isArray(result)) {
        expect(result.shape.type).toBe('text')
        expect(result.shape.fontSize).toBe(32)
        expect(result.shape.align).toBe('center')
      }
    })

    it('should parse lines with stroke properties', async () => {
      const mockResponse = {
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

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('create a thick red line', mockContext)

      if (!Array.isArray(result)) {
        expect(result.shape.type).toBe('line')
        expect(result.shape.strokeWidth).toBe(5)
        expect(result.shape.stroke).toBe('#FF0000')
      }
    })
  })

  describe('Code Block Handling', () => {
    it('should handle ```json code blocks', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: { type: 'circle', x: 100, y: 200, radiusX: 50, radiusY: 50 }
      }

      mockInvoke.mockResolvedValue({
        content: '```json\n' + JSON.stringify(mockResponse) + '\n```'
      })

      const result = await executeCommand('create a circle', mockContext)

      expect(result).toEqual(mockResponse)
    })

    it('should handle ``` code blocks without json tag', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: { type: 'circle', x: 100, y: 200, radiusX: 50, radiusY: 50 }
      }

      mockInvoke.mockResolvedValue({
        content: '```\n' + JSON.stringify(mockResponse) + '\n```'
      })

      const result = await executeCommand('create a circle', mockContext)

      expect(result).toEqual(mockResponse)
    })

    it('should handle plain JSON without code blocks', async () => {
      const mockResponse = {
        action: 'createShape',
        shape: { type: 'circle', x: 100, y: 200, radiusX: 50, radiusY: 50 }
      }

      mockInvoke.mockResolvedValue({
        content: JSON.stringify(mockResponse)
      })

      const result = await executeCommand('create a circle', mockContext)

      expect(result).toEqual(mockResponse)
    })
  })
})

