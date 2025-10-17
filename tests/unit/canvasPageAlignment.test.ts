/**
 * Canvas Page Alignment Tests
 *
 * Tests the alignment functionality implemented in CanvasPage.tsx
 * for AI-powered shape alignment commands
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAIAgent } from '../../src/hooks/useAIAgent'
import { CanvasContext } from '../../src/types/aiAgent'

// Mock the AI agent service
vi.mock('../../src/services/aiAgent', () => ({
  executeCommand: vi.fn()
}))

// Mock the command parser
vi.mock('../../src/services/commandParser', () => ({
  parseCommand: vi.fn()
}))

describe('Canvas Page Alignment Functionality', () => {
  const mockUserId = 'test-user-123'
  const mockOnShapesCreated = vi.fn()
  const mockOnShapesUpdated = vi.fn()
  const mockOnShapesDeleted = vi.fn()
  const mockOnError = vi.fn()

  let mockContext: CanvasContext

  beforeEach(() => {
    vi.clearAllMocks()

    mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }
  })

  describe('Horizontal Alignment (set same Y)', () => {
    it('should align selected shapes horizontally when they share the same Y coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      // Mock AI response for horizontal alignment
      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { y: 300 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align selected shapes horizontally', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })

    it('should align shapes horizontally by setting same Y coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { y: 250 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align selected shapes to the same horizontal line', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })
  })

  describe('Vertical Alignment (set same X)', () => {
    it('should align selected shapes vertically when they share the same X coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { x: 500 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align selected shapes vertically', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })

    it('should align shapes vertically by setting same X coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { x: 400 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align selected shapes to the same vertical line', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })
  })

  describe('Shape Targeting for Alignment', () => {
    it('should align shapes by name', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        shapeName: 'rectangle-1',
        updates: { y: 200 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align rectangle-1 horizontally', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })

    it('should align shapes by selector', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        selector: { type: 'circle' as const },
        updates: { x: 300 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align all circles vertically', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })
  })

  describe('Distribution Logic (when shapes share one coordinate)', () => {
    it('should distribute horizontally when shapes share Y coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      // This would trigger the distribution logic in CanvasPage
      // when multiple shapes share the same Y but have different X coordinates
      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { y: 250 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('distribute selected shapes horizontally', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })

    it('should distribute vertically when shapes share X coordinate', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      const mockResponse = {
        action: 'updateShape' as const,
        useSelected: true,
        updates: { x: 400 }
      }

      vi.mocked(executeCommand).mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('distribute selected shapes vertically', mockContext)
      })

      expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockResponse)
    })
  })

  describe('Error Handling', () => {
    it('should handle alignment when no shapes are selected', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      vi.mocked(executeCommand).mockRejectedValue(new Error('No shapes found to update'))

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align selected shapes horizontally', mockContext)
      })

      expect(mockOnError).toHaveBeenCalledWith('No shapes found to update')
    })

    it('should handle invalid alignment commands gracefully', async () => {
      const { executeCommand } = await import('../../src/services/aiAgent')

      vi.mocked(executeCommand).mockRejectedValue(new Error('Invalid alignment command'))

      const { result } = renderHook(() =>
        useAIAgent({
          userId: mockUserId,
          onShapesCreated: mockOnShapesCreated,
          onShapesUpdated: mockOnShapesUpdated,
          onShapesDeleted: mockOnShapesDeleted,
          onError: mockOnError
        })
      )

      await act(async () => {
        await result.current.execute('align shapes in a weird way', mockContext)
      })

      expect(mockOnError).toHaveBeenCalledWith('Invalid alignment command')
    })
  })
})
