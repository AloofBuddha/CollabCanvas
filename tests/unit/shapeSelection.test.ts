import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShapeSelection } from '../../src/hooks/useShapeSelection'

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
      
      expect(onDelete).toHaveBeenCalledWith('shape-1')
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
      
      expect(onDelete).toHaveBeenCalledWith('shape-1')
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
      
      expect(onDelete).toHaveBeenCalledWith('shape-1')
      expect(result.current.selectedShapeId).toBeNull()
      
      // Select and delete second shape
      act(() => {
        result.current.handleShapeClick(mockEvent, 'shape-2')
      })
      
      const deleteEvent2 = new KeyboardEvent('keydown', { key: 'Delete' })
      act(() => {
        window.dispatchEvent(deleteEvent2)
      })
      
      expect(onDelete).toHaveBeenCalledWith('shape-2')
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
})

