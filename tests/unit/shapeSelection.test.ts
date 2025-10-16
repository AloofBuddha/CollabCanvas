import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShapeSelection } from '../../src/hooks/useShapeSelection'
import type { Shape } from '../../src/types'

// Helper type for creating minimal shape mocks for testing
type MockShape = Pick<Shape, 'id' | 'type'> & Partial<Shape>

describe('useShapeSelection', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    vi.clearAllMocks()
  })

  describe('Selection State', () => {
    it('should initialize with no selection', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      expect(result.current.selectedShapeId).toBeNull()
      expect(result.current.isDragging).toBe(false)
    })

    it('should select shape on left click with select tool', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
    })

    it('should not select shape with rectangle tool', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'rectangle' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBeNull()
    })

    it('should not select shape on middle click', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 1 }, // Middle mouse button
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBeNull()
    })

    it('should change selection to new shape', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-2')
    })

    it('should deselect when clicking stage', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockClickEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockClickEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      const mockStageClick = {
        target: {
          getStage: () => mockStageClick.target,
        },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleStageClick(mockStageClick)
      })
      
      expect(result.current.selectedShapeId).toBeNull()
    })

    it('should not deselect when clicking shape (not stage)', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockClickEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockClickEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      const mockStage = { type: 'Stage' }
      const mockShape = { type: 'Rect', getStage: () => mockStage }
      const mockShapeClick = {
        target: mockShape,
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleStageClick(mockShapeClick)
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
    })
  })

  describe('Drag State', () => {
    it('should set dragging state on drag start', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      expect(result.current.isDragging).toBe(false)
      
      act(() => {
        result.current.handleDragStart()
      })
      
      expect(result.current.isDragging).toBe(true)
    })

    it('should clear dragging state on drag end', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      act(() => {
        result.current.handleDragStart()
      })
      
      expect(result.current.isDragging).toBe(true)
      
      act(() => {
        result.current.handleDragEnd()
      })
      
      expect(result.current.isDragging).toBe(false)
    })

    it('should handle drag lifecycle correctly', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      // Select shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      expect(result.current.isDragging).toBe(false)
      
      // Start drag
      act(() => {
        result.current.handleDragStart()
      })
      
      expect(result.current.isDragging).toBe(true)
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // End drag
      act(() => {
        result.current.handleDragEnd()
      })
      
      expect(result.current.isDragging).toBe(false)
      expect(result.current.selectedShapeId).toBe('shape-1')
    })
  })

  describe('Keyboard Deletion', () => {
    it('should call onDelete when Delete key is pressed', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // Simulate Delete key press
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent)
      })
      
      expect(onDelete).toHaveBeenCalledWith(['shape-1'])
      expect(result.current.selectedShapeId).toBeNull()
    })

    it('should call onDelete when Backspace key is pressed', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      // Simulate Backspace key press
      const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace' })
      act(() => {
        window.dispatchEvent(backspaceEvent)
      })
      
      expect(onDelete).toHaveBeenCalledWith(['shape-1'])
      expect(result.current.selectedShapeId).toBeNull()
    })

    it('should not delete when no shape is selected', () => {
      const onDelete = vi.fn()
      renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      // Simulate Delete key press
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent)
      })
      
      expect(onDelete).not.toHaveBeenCalled()
    })

    it('should not delete when tool is not select', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'rectangle' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      // Select shape (this won't work with rectangle tool, but test the case)
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      // Simulate Delete key press
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent)
      })
      
      expect(onDelete).not.toHaveBeenCalled()
    })

    it('should prevent default behavior on Delete key', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      // Simulate Delete key press with preventDefault
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      const preventDefaultSpy = vi.spyOn(deleteEvent, 'preventDefault')
      
      act(() => {
        window.dispatchEvent(deleteEvent)
      })
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not call onDelete if not provided', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      // Simulate Delete key press - should not throw error
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      expect(() => {
        act(() => {
          window.dispatchEvent(deleteEvent)
        })
      }).not.toThrow()
      
      // Selection should still be cleared
      expect(result.current.selectedShapeId).toBeNull()
    })
  })

  describe('Multiple Shapes', () => {
    it('should handle selection across multiple shapes', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      // Select first shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // Select second shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      expect(result.current.selectedShapeId).toBe('shape-2')
      
      // Select third shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-3')
      })
      expect(result.current.selectedShapeId).toBe('shape-3')
    })

    it('should delete correct shape when multiple exist', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      // Select and delete first shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      const deleteEvent1 = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent1)
      })
      
      expect(onDelete).toHaveBeenCalledWith(['shape-1'])
      expect(result.current.selectedShapeId).toBeNull()
      
      // Select and delete second shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      
      const deleteEvent2 = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent2)
      })
      
      expect(onDelete).toHaveBeenCalledWith(['shape-2'])
      expect(result.current.selectedShapeId).toBeNull()
    })
  })

  describe('Auto-Selection', () => {
    it('should provide selectShape function', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      expect(typeof result.current.selectShape).toBe('function')
    })

    it('should select shape programmatically via selectShape', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      expect(result.current.selectedShapeId).toBeNull()
      
      act(() => {
        result.current.selectShape('shape-123')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-123')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid selection changes', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
        result.current.handleShapeClick(mockEvent, 'shape-2')
        result.current.handleShapeClick(mockEvent, 'shape-3')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-3')
    })

    it('should handle selection during drag', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
        result.current.handleDragStart()
      })
      
      expect(result.current.selectedShapeId).toBe('shape-1')
      expect(result.current.isDragging).toBe(true)
      
      // Try to select another shape during drag
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      
      expect(result.current.selectedShapeId).toBe('shape-2')
      expect(result.current.isDragging).toBe(true)
    })

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Selection Switching (Regression Tests)', () => {
    const mockEvent = {
      evt: { button: 0 },
    } as any // eslint-disable-line @typescript-eslint/no-explicit-any

    it('should track when selection changes from one shape to another', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      // Select first shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // Select second shape - should track the change
      const previousSelection = result.current.selectedShapeId
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      
      expect(previousSelection).toBe('shape-1')
      expect(result.current.selectedShapeId).toBe('shape-2')
    })

    it('should allow checking if a shape is currently selected', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      // The selectedShapeId should be accessible for parent component to check
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // Parent can use this to determine if unlock is needed
      const needsUnlock = result.current.selectedShapeId === 'shape-1'
      expect(needsUnlock).toBe(true)
    })

    it('should deselect when clicking stage even with a selected shape', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      // Select a shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      expect(result.current.selectedShapeId).toBe('shape-1')
      
      // Click stage - target must equal stage for deselection to work
      const stage = { id: 'stage' }
      const stageEvent = {
        target: stage,
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      stageEvent.target.getStage = () => stage
      
      act(() => {
        result.current.handleStageClick(stageEvent)
      })
      
      expect(result.current.selectedShapeId).toBeNull()
    })
  })

  describe('Multi-Select', () => {
    it('should support selecting multiple shapes via drag-to-select', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      // Start selection at (0, 0)
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      expect(result.current.isSelecting).toBe(true)
      expect(result.current.selectionBox).toEqual({ x: 0, y: 0, width: 0, height: 0 })
      
      // Update selection to (100, 100)
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      expect(result.current.selectionBox).toEqual({ x: 0, y: 0, width: 100, height: 100 })
      
      // Create mock shapes that overlap the selection box
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
        ['shape-2', { id: 'shape-2', type: 'circle', x: 60, y: 60, radiusX: 20, radiusY: 20 } as MockShape as Shape],
        ['shape-3', { id: 'shape-3', type: 'rectangle', x: 200, y: 200, width: 50, height: 50 } as MockShape as Shape], // Outside box
      ])
      
      // Finish selection
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      expect(result.current.isSelecting).toBe(false)
      expect(result.current.selectionBox).toBeNull()
      expect(result.current.selectedShapeIds.size).toBe(2)
      expect(result.current.selectedShapeIds.has('shape-1')).toBe(true)
      expect(result.current.selectedShapeIds.has('shape-2')).toBe(true)
      expect(result.current.selectedShapeIds.has('shape-3')).toBe(false)
    })

    it('should delete all selected shapes when Delete key is pressed', () => {
      const onDelete = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDelete, tool: 'select' }))
      
      // Start selection
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
        ['shape-2', { id: 'shape-2', type: 'rectangle', x: 60, y: 60, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      expect(result.current.selectedShapeIds.size).toBe(2)
      
      // Press Delete key
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent)
      })
      
      expect(onDelete).toHaveBeenCalledWith(['shape-1', 'shape-2'])
      expect(result.current.selectedShapeIds.size).toBe(0)
    })

    it('should deselect all shapes when Escape key is pressed', () => {
      const onDeselectAll = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDeselectAll, tool: 'select' }))
      
      // Simulate multi-select
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
        ['shape-2', { id: 'shape-2', type: 'rectangle', x: 60, y: 60, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      expect(result.current.selectedShapeIds.size).toBe(2)
      
      // Press Escape key
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      act(() => {
        window.dispatchEvent(escapeEvent)
      })
      
      expect(onDeselectAll).toHaveBeenCalled()
      expect(result.current.selectedShapeIds.size).toBe(0)
    })

    it('should clear multi-select when clicking on a single shape', () => {
      const onDeselectAll = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDeselectAll, tool: 'select' }))
      
      // Simulate multi-select
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
        ['shape-2', { id: 'shape-2', type: 'rectangle', x: 60, y: 60, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      expect(result.current.selectedShapeIds.size).toBe(2)
      
      // Click on a different single shape
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-3')
      })
      
      expect(onDeselectAll).toHaveBeenCalled()
      expect(result.current.selectedShapeIds.size).toBe(1)
      expect(result.current.selectedShapeIds.has('shape-3')).toBe(true)
      expect(result.current.selectedShapeId).toBe('shape-3')
    })

    it('should set selectedShapeId to null when multiple shapes are selected', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
        ['shape-2', { id: 'shape-2', type: 'rectangle', x: 60, y: 60, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      // When multiple shapes are selected, selectedShapeId should be null
      expect(result.current.selectedShapeIds.size).toBe(2)
      expect(result.current.selectedShapeId).toBeNull()
      
      // When only one shape is selected, selectedShapeId should return that shape
      const mockEvent = {
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
      
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-1')
      })
      
      expect(result.current.selectedShapeIds.size).toBe(1)
      expect(result.current.selectedShapeId).toBe('shape-1')
    })

    it('should handle dragging in any direction for selection box', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      // Drag from bottom-right to top-left
      act(() => {
        result.current.startSelection(100, 100)
      })
      
      act(() => {
        result.current.updateSelection(0, 0)
      })
      
      // Box should normalize coordinates
      expect(result.current.selectionBox).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    })

    it('should not select shapes outside the selection box', () => {
      const { result } = renderHook(() => useShapeSelection({ tool: 'select' }))
      
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(50, 50)
      })
      
      const mockShapes = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 20, height: 20 } as MockShape as Shape], // Inside
        ['shape-2', { id: 'shape-2', type: 'rectangle', x: 100, y: 100, width: 20, height: 20 } as MockShape as Shape], // Outside
        ['shape-3', { id: 'shape-3', type: 'circle', x: 200, y: 200, radiusX: 10, radiusY: 10 } as MockShape as Shape], // Outside
      ])
      
      act(() => {
        result.current.finishSelection(mockShapes)
      })
      
      expect(result.current.selectedShapeIds.size).toBe(1)
      expect(result.current.selectedShapeIds.has('shape-1')).toBe(true)
      expect(result.current.selectedShapeIds.has('shape-2')).toBe(false)
      expect(result.current.selectedShapeIds.has('shape-3')).toBe(false)
    })

    it('should clear selection box when clicking empty space with no overlapping shapes', () => {
      const onDeselectAll = vi.fn()
      const { result } = renderHook(() => useShapeSelection({ onDeselectAll, tool: 'select' }))
      
      // Pre-select some shapes
      act(() => {
        result.current.startSelection(0, 0)
      })
      
      act(() => {
        result.current.updateSelection(100, 100)
      })
      
      const mockShapesInitial = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapesInitial)
      })
      
      expect(result.current.selectedShapeIds.size).toBe(1)
      
      // Now drag in an empty area with no shapes
      act(() => {
        result.current.startSelection(200, 200)
      })
      
      act(() => {
        result.current.updateSelection(250, 250)
      })
      
      const mockShapesEmpty = new Map<string, Shape>([
        ['shape-1', { id: 'shape-1', type: 'rectangle', x: 10, y: 10, width: 50, height: 50 } as MockShape as Shape],
      ])
      
      act(() => {
        result.current.finishSelection(mockShapesEmpty)
      })
      
      expect(onDeselectAll).toHaveBeenCalled()
      expect(result.current.selectedShapeIds.size).toBe(0)
    })
  })
})

