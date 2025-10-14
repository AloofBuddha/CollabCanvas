/**
 * Tests for useShapeDragging hook
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useShapeDragging } from '../../src/hooks/useShapeDragging'
import { Shape } from '../../src/types'

describe('useShapeDragging', () => {
  const mockShape: Shape = {
    id: 'shape-1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    color: '#ff0000',
    createdBy: 'user-1',
  }

  const createMockDragEvent = (x: number, y: number, button = 0) => ({
    target: {
      x: () => x,
      y: () => y,
      getStage: () => ({
        getRelativePointerPosition: () => ({ x, y }),
      }),
    },
    evt: { button },
  }) as any // eslint-disable-line @typescript-eslint/no-explicit-any

  describe('Cursor Tracking During Drag (Regression Test)', () => {
    it('should update cursor position during drag move', () => {
      const onCursorMove = vi.fn()
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
          onCursorMove,
        })
      )

      // Simulate drag move
      const dragEvent = createMockDragEvent(150, 200)
      result.current.handleDragMove(dragEvent, mockShape)

      // Should call onCursorMove with new position
      expect(onCursorMove).toHaveBeenCalledWith({ x: 150, y: 200 })
    })

    it('should update cursor position multiple times during continuous drag', () => {
      const onCursorMove = vi.fn()
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
          onCursorMove,
        })
      )

      // Simulate multiple drag moves
      result.current.handleDragMove(createMockDragEvent(150, 200), mockShape)
      result.current.handleDragMove(createMockDragEvent(160, 210), mockShape)
      result.current.handleDragMove(createMockDragEvent(170, 220), mockShape)

      // Should update cursor position each time
      expect(onCursorMove).toHaveBeenCalledTimes(3)
      expect(onCursorMove).toHaveBeenNthCalledWith(1, { x: 150, y: 200 })
      expect(onCursorMove).toHaveBeenNthCalledWith(2, { x: 160, y: 210 })
      expect(onCursorMove).toHaveBeenNthCalledWith(3, { x: 170, y: 220 })
    })

    it('should still work without onCursorMove callback', () => {
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
        })
      )

      // Should not throw when onCursorMove is undefined
      expect(() => {
        result.current.handleDragMove(createMockDragEvent(150, 200), mockShape)
      }).not.toThrow()
    })

    it('should update shape position during drag', () => {
      const onCursorMove = vi.fn()
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
          onCursorMove,
        })
      )

      result.current.handleDragMove(createMockDragEvent(150, 200), mockShape)

      // Should update shape position (node position is center, converts to top-left)
      // Node at (150, 200) with width=50, height=50 -> top-left at (125, 175)
      expect(updateShape).toHaveBeenCalledWith('shape-1', { x: 125, y: 175 })
    })

    it('should call onDragUpdate callback if provided', () => {
      const onCursorMove = vi.fn()
      const updateShape = vi.fn()
      const onDragUpdate = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
          onDragUpdate,
          onCursorMove,
        })
      )

      result.current.handleDragMove(createMockDragEvent(150, 200), mockShape)

      // Should call onDragUpdate with shape id and updates (converted from center to top-left)
      expect(onDragUpdate).toHaveBeenCalledWith('shape-1', { x: 125, y: 175 })
    })
  })

  describe('Panning Collision Prevention', () => {
    it('should prevent drag when isPanning is true', () => {
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: true,
          updateShape,
        })
      )

      const mockStopDrag = vi.fn()
      const dragEvent = {
        target: { stopDrag: mockStopDrag },
        evt: { button: 0 },
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      result.current.handleDragStart(dragEvent)

      expect(mockStopDrag).toHaveBeenCalled()
    })

    it('should prevent drag when middle mouse button is used', () => {
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
        })
      )

      const mockStopDrag = vi.fn()
      const dragEvent = {
        target: { stopDrag: mockStopDrag },
        evt: { button: 1 }, // Middle mouse button
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      result.current.handleDragStart(dragEvent)

      expect(mockStopDrag).toHaveBeenCalled()
    })

    it('should allow drag when not panning and left mouse button', () => {
      const updateShape = vi.fn()
      
      const { result } = renderHook(() =>
        useShapeDragging({
          isPanning: false,
          updateShape,
        })
      )

      const mockStopDrag = vi.fn()
      const dragEvent = {
        target: { stopDrag: mockStopDrag },
        evt: { button: 0 }, // Left mouse button
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any

      result.current.handleDragStart(dragEvent)

      // Should NOT call stopDrag
      expect(mockStopDrag).not.toHaveBeenCalled()
    })
  })
})

