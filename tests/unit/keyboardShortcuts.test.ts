/**
 * Keyboard Shortcuts Tests
 * 
 * Tests for the useKeyboardShortcuts hook and related functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts'
import useShapeStore from '../../src/stores/useShapeStore'
import useHistoryStore from '../../src/stores/useHistoryStore'
import { CircleShape, RectangleShape, Shape } from '../../src/types'

// Helper to create keyboard events
function createKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  })
}

// Helper to create test circle
function createTestCircle(overrides: Partial<CircleShape> = {}): CircleShape {
  return {
    id: 'shape-1',
    type: 'circle',
    x: 100,
    y: 100,
    radiusX: 50,
    radiusY: 50,
    color: '#000000',
    rotation: 0,
    lockedBy: null,
    createdBy: 'test-user',
    ...overrides,
  }
}

// Helper to create test rectangle
function createTestRectangle(overrides: Partial<RectangleShape> = {}): RectangleShape {
  return {
    id: 'shape-2',
    type: 'rectangle',
    x: 200,
    y: 200,
    width: 100,
    height: 50,
    color: '#FF0000',
    rotation: 0,
    lockedBy: null,
    createdBy: 'test-user',
    ...overrides,
  }
}

describe('useKeyboardShortcuts', () => {
  let mockCallbacks: {
    onUndo: ReturnType<typeof vi.fn>
    onRedo: ReturnType<typeof vi.fn>
    onDuplicate: ReturnType<typeof vi.fn>
    onToggleHelp: ReturnType<typeof vi.fn>
    onDeselectAll: ReturnType<typeof vi.fn>
    onPersistShapes: (shapes: Record<string, Shape>) => Promise<void>
    onPersistShape: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset stores
    useShapeStore.getState().clearShapes()
    useHistoryStore.getState().clearHistory()
    
    // Create mock callbacks
    mockCallbacks = {
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onDuplicate: vi.fn(),
      onToggleHelp: vi.fn(),
      onDeselectAll: vi.fn(),
      onPersistShapes: vi.fn().mockResolvedValue(undefined),
      onPersistShape: vi.fn(),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Undo/Redo', () => {
    it('should call onUndo when Ctrl+Z is pressed', async () => {
      const { pushState } = useHistoryStore.getState()
      const { setShapes } = useShapeStore.getState()
      
      // Setup initial state
      const initialShapes = {
        'shape-1': createTestCircle(),
      }
      const updatedShapes = {
        'shape-1': createTestCircle({ x: 200, y: 200 }),
      }
      
      setShapes(initialShapes)
      pushState(initialShapes)
      setShapes(updatedShapes)
      pushState(updatedShapes)
      
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      // Trigger Ctrl+Z
      await act(async () => {
        window.dispatchEvent(createKeyboardEvent('z', { ctrlKey: true }))
        // Wait for async persistence
        await new Promise(resolve => setTimeout(resolve, 10))
      })
      
      expect(mockCallbacks.onDeselectAll).toHaveBeenCalled()
      expect(mockCallbacks.onPersistShapes).toHaveBeenCalled()
      expect(mockCallbacks.onUndo).toHaveBeenCalled()
    })

    it('should call onRedo when Ctrl+Shift+Z is pressed', async () => {
      const { pushState, undo } = useHistoryStore.getState()
      const { setShapes } = useShapeStore.getState()
      
      // Setup state with history
      const initialShapes = {
        'shape-1': createTestCircle(),
      }
      const updatedShapes = {
        'shape-1': createTestCircle({ x: 200, y: 200 }),
      }
      
      setShapes(initialShapes)
      pushState(initialShapes)
      setShapes(updatedShapes)
      pushState(updatedShapes)
      undo() // Create something to redo
      
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      // Trigger Ctrl+Shift+Z
      await act(async () => {
        window.dispatchEvent(createKeyboardEvent('Z', { ctrlKey: true, shiftKey: true }))
        await new Promise(resolve => setTimeout(resolve, 10))
      })
      
      expect(mockCallbacks.onDeselectAll).toHaveBeenCalled()
      expect(mockCallbacks.onPersistShapes).toHaveBeenCalled()
      expect(mockCallbacks.onRedo).toHaveBeenCalled()
    })

    it('should call onRedo when Ctrl+Y is pressed', async () => {
      const { pushState, undo } = useHistoryStore.getState()
      const { setShapes } = useShapeStore.getState()
      
      // Setup state with history
      const initialShapes = {
        'shape-1': createTestCircle(),
      }
      const updatedShapes = {
        'shape-1': createTestCircle({ x: 200, y: 200 }),
      }
      
      setShapes(initialShapes)
      pushState(initialShapes)
      setShapes(updatedShapes)
      pushState(updatedShapes)
      undo()
      
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      // Trigger Ctrl+Y
      await act(async () => {
        window.dispatchEvent(createKeyboardEvent('y', { ctrlKey: true }))
        await new Promise(resolve => setTimeout(resolve, 10))
      })
      
      expect(mockCallbacks.onRedo).toHaveBeenCalled()
    })

    it('should pass shapes to onPersistShapes callback during undo', async () => {
      const { pushState } = useHistoryStore.getState()
      const { setShapes } = useShapeStore.getState()
      
      // Setup state with shape history
      const initialShapes = {
        'shape-1': createTestCircle(),
      }
      const updatedShapes = {
        'shape-1': createTestCircle({ x: 200, y: 200 }),
      }
      
      setShapes(initialShapes)
      pushState(initialShapes)
      setShapes(updatedShapes)
      pushState(updatedShapes)
      
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      // Trigger undo
      await act(async () => {
        window.dispatchEvent(createKeyboardEvent('z', { ctrlKey: true }))
        await new Promise(resolve => setTimeout(resolve, 10))
      })
      
      // Verify that onPersistShapes was called with the previous state
      // Note: The clearing of locks happens in Canvas.tsx, not in the hook itself
      expect(mockCallbacks.onPersistShapes).toHaveBeenCalled()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const persistedShapes = (mockCallbacks.onPersistShapes as any).mock.calls[0][0]
      expect(persistedShapes).toEqual(initialShapes)
    })
  })

  describe('Arrow Key Nudging', () => {
    it('should nudge selected shape up by 1px', () => {
      const { addShape } = useShapeStore.getState()
      const shape = createTestCircle()
      addShape(shape)
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowUp'))
      })
      
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-1', y: 99 })
      )
    })

    it('should nudge selected shape down by 10px with Shift', () => {
      const { addShape } = useShapeStore.getState()
      const shape = createTestCircle()
      addShape(shape)
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowDown', { shiftKey: true }))
      })
      
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-1', y: 110 })
      )
    })

    it('should nudge selected shape left by 1px', () => {
      const { addShape } = useShapeStore.getState()
      const shape = createTestCircle()
      addShape(shape)
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowLeft'))
      })
      
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-1', x: 99 })
      )
    })

    it('should nudge selected shape right by 10px with Shift', () => {
      const { addShape } = useShapeStore.getState()
      const shape = createTestCircle()
      addShape(shape)
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowRight', { shiftKey: true }))
      })
      
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-1', x: 110 })
      )
    })

    it('should nudge multiple selected shapes', () => {
      const { addShape } = useShapeStore.getState()
      
      addShape(createTestCircle())
      addShape(createTestRectangle())
      
      const selectedShapeIds = new Set(['shape-1', 'shape-2'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowUp'))
      })
      
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledTimes(2)
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-1', y: 99 })
      )
      expect(mockCallbacks.onPersistShape).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'shape-2', y: 199 })
      )
    })

    it('should not nudge when no shapes are selected', () => {
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds: new Set() }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowUp'))
      })
      
      expect(mockCallbacks.onPersistShape).not.toHaveBeenCalled()
    })

    it('should not trigger nudge when typing in input fields', () => {
      const { addShape } = useShapeStore.getState()
      addShape(createTestCircle())
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      // Create input element and focus it
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      
      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', { value: input, writable: false })
        window.dispatchEvent(event)
      })
      
      expect(mockCallbacks.onPersistShape).not.toHaveBeenCalled()
      
      // Cleanup
      document.body.removeChild(input)
    })
  })

  describe('Duplicate', () => {
    it('should call onDuplicate when Ctrl+D is pressed with selection', () => {
      const { addShape } = useShapeStore.getState()
      addShape(createTestCircle())
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('d', { ctrlKey: true }))
      })
      
      expect(mockCallbacks.onDuplicate).toHaveBeenCalled()
      
      // Verify shape was added to store
      const { shapes } = useShapeStore.getState()
      expect(Object.keys(shapes).length).toBe(2) // Original + duplicate
    })

    it('should not duplicate when no shapes are selected', () => {
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds: new Set() }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('d', { ctrlKey: true }))
      })
      
      expect(mockCallbacks.onDuplicate).not.toHaveBeenCalled()
    })

    it('should offset duplicated shapes by 20px', () => {
      const { addShape } = useShapeStore.getState()
      addShape(createTestCircle())
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('d', { ctrlKey: true }))
      })
      
      const { shapes } = useShapeStore.getState()
      const duplicatedShape = Object.values(shapes).find(s => s.id !== 'shape-1')
      
      expect(duplicatedShape).toBeDefined()
      expect(duplicatedShape?.x).toBe(120) // 100 + 20
      expect(duplicatedShape?.y).toBe(120) // 100 + 20
    })

    it('should not copy lock state when duplicating', () => {
      const { addShape } = useShapeStore.getState()
      addShape(createTestCircle({ lockedBy: 'user-123' }))
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('d', { ctrlKey: true }))
      })
      
      const { shapes } = useShapeStore.getState()
      const duplicatedShape = Object.values(shapes).find(s => s.id !== 'shape-1')
      
      expect(duplicatedShape?.lockedBy).toBeNull()
    })
  })

  describe('Toggle Help', () => {
    it('should call onToggleHelp when ? is pressed', () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('?'))
      })
      
      expect(mockCallbacks.onToggleHelp).toHaveBeenCalled()
    })

    it('should call onToggleHelp when Shift+/ is pressed', () => {
      renderHook(() => useKeyboardShortcuts(mockCallbacks))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('/', { shiftKey: true }))
      })
      
      expect(mockCallbacks.onToggleHelp).toHaveBeenCalled()
    })
  })

  describe('History Store', () => {
    it('should track state history correctly', () => {
      const { pushState, canUndo, canRedo } = useHistoryStore.getState()
      
      expect(canUndo()).toBe(false)
      expect(canRedo()).toBe(false)
      
      const state1 = { 'shape-1': createTestCircle() }
      pushState(state1)
      
      expect(canUndo()).toBe(false) // First state, nothing to undo to
      
      const state2 = { 'shape-1': createTestCircle({ x: 200, y: 200 }) }
      pushState(state2)
      
      expect(canUndo()).toBe(true) // Can undo to state1
      expect(canRedo()).toBe(false)
    })

    it('should restore previous state on undo', () => {
      const { pushState, undo } = useHistoryStore.getState()
      
      const state1 = { 'shape-1': createTestCircle() }
      const state2 = { 'shape-1': createTestCircle({ x: 200, y: 200 }) }
      
      pushState(state1)
      pushState(state2)
      
      const previousState = undo()
      
      expect(previousState).toEqual(state1)
    })

    it('should restore next state on redo', () => {
      const { pushState, undo, redo } = useHistoryStore.getState()
      
      const state1 = { 'shape-1': createTestCircle() }
      const state2 = { 'shape-1': createTestCircle({ x: 200, y: 200 }) }
      
      pushState(state1)
      pushState(state2)
      undo()
      
      const nextState = redo()
      
      expect(nextState).toEqual(state2)
    })

    it('should clear future stack when new action is performed', () => {
      const { pushState, undo, canRedo } = useHistoryStore.getState()
      
      const state1 = { 'shape-1': createTestCircle() }
      const state2 = { 'shape-1': createTestCircle({ x: 200, y: 200 }) }
      const state3 = { 'shape-1': createTestCircle({ x: 300, y: 300 }) }
      
      pushState(state1)
      pushState(state2)
      undo()
      
      expect(canRedo()).toBe(true)
      
      pushState(state3) // New action
      
      expect(canRedo()).toBe(false) // Future cleared
    })

    it('should limit history to MAX_HISTORY states', () => {
      const { pushState } = useHistoryStore.getState()
      
      // Push 60 states (MAX_HISTORY is 50)
      for (let i = 0; i < 60; i++) {
        pushState({
          'shape-1': createTestCircle({ x: i })
        })
      }
      
      const { past } = useHistoryStore.getState()
      expect(past.length).toBeLessThanOrEqual(50)
    })
  })

  describe('Disabled State', () => {
    it('should not respond to keyboard shortcuts when disabled', () => {
      const { addShape } = useShapeStore.getState()
      addShape(createTestCircle())
      
      const selectedShapeIds = new Set(['shape-1'])
      renderHook(() => useKeyboardShortcuts({ ...mockCallbacks, selectedShapeIds, disabled: true }))
      
      act(() => {
        window.dispatchEvent(createKeyboardEvent('ArrowUp'))
        window.dispatchEvent(createKeyboardEvent('d', { ctrlKey: true }))
        window.dispatchEvent(createKeyboardEvent('?'))
      })
      
      expect(mockCallbacks.onPersistShape).not.toHaveBeenCalled()
      expect(mockCallbacks.onDuplicate).not.toHaveBeenCalled()
      expect(mockCallbacks.onToggleHelp).not.toHaveBeenCalled()
    })
  })
})

