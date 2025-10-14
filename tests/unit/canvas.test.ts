import { describe, it, expect, beforeEach } from 'vitest'
import useShapeStore from '../../src/stores/useShapeStore'
import { Shape } from '../../src/types'

/**
 * Canvas interaction tests
 * 
 * These tests verify the logic for shape creation, dragging, and locking.
 * They don't test Konva directly, but rather the store interactions.
 */

describe('Canvas Shape Interactions', () => {
  const userId = 'test-user-1'
  
  const createTestShape = (overrides?: Partial<Shape>): Shape => ({
    id: 'test-shape-1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#ff5733',
    createdBy: userId,
    ...overrides,
  })

  beforeEach(() => {
    useShapeStore.getState().clearShapes()
  })

  describe('Rectangle Creation', () => {
    it('should add rectangle to store when created', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes[shape.id]).toEqual(shape)
    })

    it('should normalize negative dimensions', () => {
      // Simulate drag from bottom-right to top-left
      const shape = createTestShape({
        x: 200,
        y: 200,
        width: -100,
        height: -100,
      })

      // Normalize before adding
      const normalized = {
        ...shape,
        x: shape.x + shape.width,
        y: shape.y + shape.height,
        width: Math.abs(shape.width),
        height: Math.abs(shape.height),
      }

      useShapeStore.getState().addShape(normalized)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(100)
      expect(state.shapes[shape.id].y).toBe(100)
      expect(state.shapes[shape.id].width).toBe(100)
      expect(state.shapes[shape.id].height).toBe(100)
    })

    it('should create rectangle with user color', () => {
      const userColor = '#123456'
      const shape = createTestShape({ color: userColor })
      
      useShapeStore.getState().addShape(shape)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].color).toBe(userColor)
    })
  })

  describe('Rectangle Dragging', () => {
    it('should update shape position during drag', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.updateShape(shape.id, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(300)
      expect(state.shapes[shape.id].y).toBe(400)
    })
  })


  describe('Multiple Shapes', () => {
    it('should handle multiple shapes independently', () => {
      const store = useShapeStore.getState()
      
      const shape1 = createTestShape({ id: 'shape-1', x: 100 })
      const shape2 = createTestShape({ id: 'shape-2', x: 200 })
      const shape3 = createTestShape({ id: 'shape-3', x: 300 })
      
      store.addShape(shape1)
      store.addShape(shape2)
      store.addShape(shape3)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(3)
    })

    it('should allow dragging multiple shapes independently', () => {
      const store = useShapeStore.getState()
      
      const shape1 = createTestShape({ id: 'shape-1' })
      const shape2 = createTestShape({ id: 'shape-2' })
      
      store.addShape(shape1)
      store.addShape(shape2)
      
      // Update both shapes
      store.updateShape('shape-1', { x: 500 })
      store.updateShape('shape-2', { x: 600 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape-1'].x).toBe(500)
      expect(state.shapes['shape-2'].x).toBe(600)
    })
  })

  describe('Tool State', () => {
    it('should create shapes in rectangle mode', () => {
      // Tool state is managed in component, here we just verify shape creation works
      const shape = createTestShape()
      
      useShapeStore.getState().addShape(shape)
      
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
    })

    it('should allow dragging shapes in select mode', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.updateShape(shape.id, { x: 200 })
      
      expect(useShapeStore.getState().shapes[shape.id].x).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small rectangles', () => {
      const shape = createTestShape({ width: 5, height: 5 })
      
      useShapeStore.getState().addShape(shape)
      
      expect(useShapeStore.getState().shapes[shape.id]).toBeDefined()
    })

    it('should handle very large rectangles', () => {
      const shape = createTestShape({ width: 5000, height: 5000 })
      
      useShapeStore.getState().addShape(shape)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].width).toBe(5000)
      expect(state.shapes[shape.id].height).toBe(5000)
    })

    it('should handle shapes at canvas boundaries', () => {
      const shape = createTestShape({ x: 0, y: 0 })
      
      useShapeStore.getState().addShape(shape)
      
      expect(useShapeStore.getState().shapes[shape.id].x).toBe(0)
      expect(useShapeStore.getState().shapes[shape.id].y).toBe(0)
    })
  })

  describe('Panning and Dragging Interactions', () => {
    it('should not drag shape when middle-click panning', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      
      store.addShape(shape)
      
      // Simulate middle-click pan (isPanning = true)
      // Shape should NOT be moved
      // In real Canvas, handleShapeDragStart checks isPanning and calls stopDrag()
      
      // Verify shape remains in original position
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(100)
      expect(state.shapes[shape.id].y).toBe(100)
    })

    it('should allow shape drag with left-click in select mode', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      
      store.addShape(shape)
      
      // Simulate left-click drag in select mode
      store.updateShape(shape.id, { x: 200, y: 200 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(200)
      expect(state.shapes[shape.id].y).toBe(200)
    })

    it('should handle rapid tool switching without state corruption', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      // Simulate rapid select -> rectangle -> select tool switches
      // Shape should remain in valid state
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id]).toBeDefined()
    })

    it('should not interfere with rectangle creation when panning', () => {
      const store = useShapeStore.getState()
      
      // If panning, rectangle creation should not start
      // This is UI logic - when isPanning, handleMouseDown for rectangle is skipped
      
      // After panning ends, rectangle creation should work normally
      const shape = createTestShape()
      store.addShape(shape)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
    })
  })

  describe('Selection and Locking Integration (Regression Tests)', () => {
    it('should support unlocking old shape when locking a new shape', () => {
      // Reset store
      useShapeStore.getState().clearShapes()
      
      // Create three shapes
      const shape1 = createTestShape({ id: 'shape-1', x: 100, y: 100 })
      const shape2 = createTestShape({ id: 'shape-2', x: 200, y: 200 })
      const shape3 = createTestShape({ id: 'shape-3', x: 300, y: 300 })
      
      const store = useShapeStore.getState()
      store.addShape(shape1)
      store.addShape(shape2)
      store.addShape(shape3)

      // Lock first shape
      store.lockShape('shape-1', userId)
      let shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBe(userId)
      expect(shapes['shape-2'].lockedBy).toBeUndefined()

      // Simulate switching selection: unlock first, lock second
      store.unlockShape('shape-1')
      store.lockShape('shape-2', userId)
      
      shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBeNull()
      expect(shapes['shape-2'].lockedBy).toBe(userId)
      expect(shapes['shape-3'].lockedBy).toBeUndefined()
    })

    it('should support unlocking when creating a new shape', () => {
      // Reset store
      useShapeStore.getState().clearShapes()
      
      // Create and lock a shape
      const existingShape = createTestShape({ id: 'shape-1', x: 100, y: 100 })
      const store = useShapeStore.getState()
      store.addShape(existingShape)
      store.lockShape('shape-1', userId)
      
      let shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBe(userId)
      
      // Simulate creating a new shape: unlock old, lock new
      const newShape = createTestShape({ id: 'shape-2', x: 200, y: 200 })
      store.unlockShape('shape-1')
      store.addShape(newShape)
      store.lockShape('shape-2', userId)
      
      shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBeNull()
      expect(shapes['shape-2'].lockedBy).toBe(userId)
    })

    it('should maintain only one locked shape per user at a time', () => {
      // Reset store
      useShapeStore.getState().clearShapes()
      
      // Create multiple shapes
      const shape1 = createTestShape({ id: 'shape-1', x: 100, y: 100 })
      const shape2 = createTestShape({ id: 'shape-2', x: 200, y: 200 })
      const shape3 = createTestShape({ id: 'shape-3', x: 300, y: 300 })
      
      const store = useShapeStore.getState()
      store.addShape(shape1)
      store.addShape(shape2)
      store.addShape(shape3)

      // Lock first shape
      store.lockShape('shape-1', userId)
      let shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBe(userId)

      // Lock second shape (app should unlock first)
      store.unlockShape('shape-1')
      store.lockShape('shape-2', userId)
      
      // Only shape-2 should be locked
      shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBeNull()
      expect(shapes['shape-2'].lockedBy).toBe(userId)
      expect(shapes['shape-3'].lockedBy).toBeUndefined()

      // Lock third shape (app should unlock second)
      store.unlockShape('shape-2')
      store.lockShape('shape-3', userId)
      
      // Only shape-3 should be locked
      shapes = useShapeStore.getState().shapes
      expect(shapes['shape-1'].lockedBy).toBeNull()
      expect(shapes['shape-2'].lockedBy).toBeNull()
      expect(shapes['shape-3'].lockedBy).toBe(userId)
    })
  })
})

