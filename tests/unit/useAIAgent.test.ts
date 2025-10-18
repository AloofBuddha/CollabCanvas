/**
 * useAIAgent Hook Tests
 * 
 * Tests the AI agent hook logic for handling commands and state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAIAgent } from '../../src/hooks/useAIAgent'
import type { AICommandResponse } from '../../src/types/aiAgent'

// Mock the AI agent service
vi.mock('../../src/services/aiAgent', () => ({
  executeCommand: vi.fn()
}))

// Mock the command parser
vi.mock('../../src/services/commandParser', () => ({
  parseCommand: vi.fn()
}))

describe('useAIAgent Hook', () => {
  const mockUserId = 'test-user-123'
  const mockOnShapesCreated = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    expect(result.current.isOpen).toBe(false)
    expect(result.current.isExecuting).toBe(false)
    expect(result.current.currentCommand).toBe('')
  })

  it('should toggle the AI agent panel', () => {
    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should update current command', () => {
    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    act(() => {
      result.current.setCurrentCommand('create a red circle')
    })

    expect(result.current.currentCommand).toBe('create a red circle')
  })

  it('should execute command with single shape response', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')
    const { parseCommand } = await import('../../src/services/commandParser')

    const mockResponse = {
      action: 'createShape' as const,
      shape: {
        type: 'circle' as const,
        x: 100,
        y: 200,
        radiusX: 50,
        radiusY: 50,
        fill: '#FF0000'
      }
    }

    const mockShape = {
      id: 'shape-123',
      type: 'circle' as const,
      x: 100,
      y: 200,
      radiusX: 50,
      radiusY: 50,
      color: '#FF0000',
      createdBy: mockUserId,
      rotation: 0
    }

    vi.mocked(executeCommand).mockResolvedValue(mockResponse)
    vi.mocked(parseCommand).mockReturnValue([mockShape])

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('create a red circle', mockContext)
    })

    expect(executeCommand).toHaveBeenCalledWith('create a red circle', mockContext)
    expect(parseCommand).toHaveBeenCalledWith(mockResponse, mockUserId)
    expect(mockOnShapesCreated).toHaveBeenCalledWith([mockShape])
    expect(result.current.currentCommand).toBe('') // Should clear on success
    expect(result.current.isExecuting).toBe(false)
  })

  it('should execute command with array response', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')
    const { parseCommand } = await import('../../src/services/commandParser')

    const mockResponse = [
      {
        action: 'createShape' as const,
        shape: {
          type: 'circle' as const,
          x: 100,
          y: 200,
          radiusX: 50,
          radiusY: 50,
          fill: '#FFFF00'
        }
      },
      {
        action: 'createShape' as const,
        shape: {
          type: 'circle' as const,
          x: 150,
          y: 250,
          radiusX: 10,
          radiusY: 10,
          fill: '#000000'
        }
      }
    ]

    const mockShapes = [
      { id: 'shape-1', type: 'circle' as const, x: 100, y: 200, radiusX: 50, radiusY: 50, color: '#FFFF00', createdBy: mockUserId, rotation: 0 },
      { id: 'shape-2', type: 'circle' as const, x: 150, y: 250, radiusX: 10, radiusY: 10, color: '#000000', createdBy: mockUserId, rotation: 0 }
    ]

    vi.mocked(executeCommand).mockResolvedValue(mockResponse)
    vi.mocked(parseCommand)
      .mockReturnValueOnce([mockShapes[0]])
      .mockReturnValueOnce([mockShapes[1]])

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('make a smiley face', mockContext)
    })

    expect(parseCommand).toHaveBeenCalledTimes(2)
    // With the new implementation, onShapesCreated is called once with all shapes
    expect(mockOnShapesCreated).toHaveBeenCalledTimes(1)
    expect(mockOnShapesCreated).toHaveBeenCalledWith([mockShapes[0], mockShapes[1]])
  })

  it('should handle errors gracefully', async () => {
    // Suppress expected console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { executeCommand } = await import('../../src/services/aiAgent')

    vi.mocked(executeCommand).mockRejectedValue(new Error('AI service unavailable'))

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('create a circle', mockContext)
    })

    expect(mockOnError).toHaveBeenCalledWith('AI service unavailable')
    expect(mockOnShapesCreated).not.toHaveBeenCalled()
    expect(result.current.isExecuting).toBe(false)

    consoleErrorSpy.mockRestore()
  })

  it('should not execute if command is empty', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('   ', mockContext)
    })

    expect(executeCommand).not.toHaveBeenCalled()
    expect(mockOnShapesCreated).not.toHaveBeenCalled()
  })

  it('should handle updateShape command', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')
    const mockOnShapesUpdated = vi.fn()

    const mockUpdateCommand = {
      action: 'updateShape' as const,
      shapeName: 'circle-1',
      updates: { color: '#FF0000' }
    }

    vi.mocked(executeCommand).mockResolvedValue(mockUpdateCommand)

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: mockOnShapesUpdated,
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('make circle-1 red', mockContext)
    })

    expect(mockOnShapesUpdated).toHaveBeenCalledWith(mockUpdateCommand)
    expect(mockOnShapesCreated).not.toHaveBeenCalled()
  })

  it('should handle deleteShape command', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')
    const mockOnShapesDeleted = vi.fn()

    const mockDeleteCommand = {
      action: 'deleteShape' as const,
      shapeName: 'circle-1'
    }

    vi.mocked(executeCommand).mockResolvedValue(mockDeleteCommand)

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: mockOnShapesDeleted,
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    await act(async () => {
      await result.current.execute('delete circle-1', mockContext)
    })

    expect(mockOnShapesDeleted).toHaveBeenCalledWith(mockDeleteCommand)
    expect(mockOnShapesCreated).not.toHaveBeenCalled()
  })

  it('should close the panel and clear command', () => {
    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    act(() => {
      result.current.toggle()
      result.current.setCurrentCommand('test command')
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.currentCommand).toBe('test command')

    act(() => {
      result.current.close()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.currentCommand).toBe('')
  })

  it('should set isExecuting during command execution', async () => {
    const { executeCommand } = await import('../../src/services/aiAgent')
    const { parseCommand } = await import('../../src/services/commandParser')

    let resolveExecute: (value: AICommandResponse) => void
    const executePromise = new Promise<AICommandResponse>((resolve) => {
      resolveExecute = resolve
    })

    const mockShape = { 
      id: 'shape-1', 
      type: 'circle' as const, 
      x: 100, 
      y: 200, 
      radiusX: 50, 
      radiusY: 50, 
      color: '#FF0000', 
      createdBy: mockUserId, 
      rotation: 0 
    }

    vi.mocked(executeCommand).mockReturnValue(executePromise)
    vi.mocked(parseCommand).mockReturnValue([mockShape])

    const { result } = renderHook(() =>
      useAIAgent({
        userId: mockUserId,
        onShapesCreated: mockOnShapesCreated,
        onShapesUpdated: vi.fn(),
        onShapesDeleted: vi.fn(),
        onError: mockOnError
      })
    )

    const mockContext = {
      canvasDimensions: { width: 1920, height: 1080 },
      viewport: { x: 0, y: 0, scale: 1 },
      shapes: [],
      selectedShapeIds: []
    }

    // Start execution
    act(() => {
      result.current.execute('create a circle', mockContext)
    })

    // Should be executing
    await waitFor(() => {
      expect(result.current.isExecuting).toBe(true)
    })

    // Resolve the promise
    act(() => {
      resolveExecute({
        action: 'createShape',
        shape: { type: 'circle', x: 100, y: 200 }
      })
    })

    // Should finish executing
    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false)
    })
  })
})

