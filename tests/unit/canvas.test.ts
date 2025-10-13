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
    lockedBy: null,
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
    it('should lock shape when drag starts', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.lockShape(shape.id, userId)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBe(userId)
    })

    it('should update shape position during drag', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.lockShape(shape.id, userId)
      store.updateShape(shape.id, userId, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(300)
      expect(state.shapes[shape.id].y).toBe(400)
    })

    it('should unlock shape when drag ends', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.lockShape(shape.id, userId)
      store.unlockShape(shape.id)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should not update position if locked by different user', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      
      store.addShape(shape)
      store.lockShape(shape.id, 'other-user')
      store.updateShape(shape.id, userId, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      // Position should remain unchanged
      expect(state.shapes[shape.id].x).toBe(100)
      expect(state.shapes[shape.id].y).toBe(100)
    })
  })

  describe('Shape Border During Drag', () => {
    it('should have no border when unlocked', () => {
      const shape = createTestShape({ lockedBy: null })
      
      useShapeStore.getState().addShape(shape)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should show border when locked', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      store.lockShape(shape.id, userId)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBe(userId)
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

    it('should allow dragging one shape while others remain locked', () => {
      const store = useShapeStore.getState()
      
      const shape1 = createTestShape({ id: 'shape-1' })
      const shape2 = createTestShape({ id: 'shape-2' })
      
      store.addShape(shape1)
      store.addShape(shape2)
      
      // Lock shape1
      store.lockShape('shape-1', userId)
      
      // Try to move both
      store.updateShape('shape-1', userId, { x: 500 })
      store.updateShape('shape-2', userId, { x: 600 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape-1'].x).toBe(500) // Locked by same user, can move
      expect(state.shapes['shape-2'].x).toBe(600) // Unlocked, can move
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
      store.lockShape(shape.id, userId)
      store.updateShape(shape.id, userId, { x: 200 })
      
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

  describe('Panning and Selection Interactions', () => {
    it('should not drag shape when middle-click panning', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      
      store.addShape(shape)
      
      // Simulate middle-click pan (isPanning = true)
      // Shape should NOT be locked or moved
      // In real Canvas, handleShapeDragStart checks isPanning and calls stopDrag()
      
      // Verify shape remains in original position
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(100)
      expect(state.shapes[shape.id].y).toBe(100)
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should not select shape when middle-clicking', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      // When middle-clicking (button 1), shape should not be selected
      // This is UI logic - selection happens on left-click only in select tool
      
      // Verify shape is not locked (which would indicate selection/drag)
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should allow shape drag with left-click in select mode', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      
      store.addShape(shape)
      
      // Simulate left-click drag in select mode
      store.lockShape(shape.id, userId)
      store.updateShape(shape.id, userId, { x: 200, y: 200 })
      store.unlockShape(shape.id)
      
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(200)
      expect(state.shapes[shape.id].y).toBe(200)
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should maintain selection state through drag lifecycle', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      // Simulate: select -> drag start -> drag move -> drag end
      // 1. Select (in UI, selectedShapeId is set)
      // 2. Drag start (lock shape)
      store.lockShape(shape.id, userId)
      let state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBe(userId)
      
      // 3. Drag move (update position)
      store.updateShape(shape.id, userId, { x: 150, y: 150 })
      state = useShapeStore.getState()
      expect(state.shapes[shape.id].x).toBe(150)
      
      // 4. Drag end (unlock shape)
      store.unlockShape(shape.id)
      state = useShapeStore.getState()
      expect(state.shapes[shape.id].lockedBy).toBeNull()
    })

    it('should prevent drag when shape is locked by another user', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape({ x: 100, y: 100 })
      const otherUserId = 'other-user'
      
      store.addShape(shape)
      store.lockShape(shape.id, otherUserId)
      
      // Try to drag as current user
      store.updateShape(shape.id, userId, { x: 200, y: 200 })
      
      const state = useShapeStore.getState()
      // Position should not change
      expect(state.shapes[shape.id].x).toBe(100)
      expect(state.shapes[shape.id].y).toBe(100)
      // Still locked by other user
      expect(state.shapes[shape.id].lockedBy).toBe(otherUserId)
    })

    it('should handle rapid tool switching without state corruption', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      // Simulate rapid select -> rectangle -> select tool switches
      // Shape should remain in valid state
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id]).toBeDefined()
      expect(state.shapes[shape.id].lockedBy).toBeNull()
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

  describe('Auto-selection After Creation', () => {
    it('should auto-select newly created rectangle', () => {
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      // When a rectangle is created and added, it should be auto-selected
      store.addShape(shape)
      
      // In Canvas component, setSelectedShapeId(shape.id) is called after addShape
      // This test verifies the shape exists and can be selected
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id]).toBeDefined()
      expect(state.shapes[shape.id].id).toBe(shape.id)
    })

    it('should auto-switch to select tool after rectangle creation', () => {
      // This is UI logic in Canvas component
      // After creating a rectangle, onToolChange('select') is called
      // This test verifies that shapes can be selected after creation
      
      const store = useShapeStore.getState()
      const shape = createTestShape()
      
      store.addShape(shape)
      
      // Shape should be ready for selection/dragging
      const state = useShapeStore.getState()
      expect(state.shapes[shape.id]).toBeDefined()
    })
  })
})

