import { describe, it, expect, beforeEach } from 'vitest'
import useShapeStore from '../../src/stores/useShapeStore'
import { RectangleShape, CircleShape } from '../../src/types'

describe('useShapeStore', () => {
  // Helper functions to create test shapes
  const createTestRectangle = (overrides?: Partial<RectangleShape>): RectangleShape => ({
    id: 'rectangle1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#ff5733',
    createdBy: 'user1',
    ...overrides,
  })

  const createTestCircle = (overrides?: Partial<CircleShape>): CircleShape => ({
    id: 'circle1',
    type: 'circle',
    x: 100,
    y: 100,
    radiusX: 100,
    radiusY: 75,
    color: '#ff5733',
    createdBy: 'user1',
    ...overrides,
  })

  beforeEach(() => {
    // Reset store to initial state before each test
    useShapeStore.getState().clearShapes()
  })

  describe('addShape', () => {
    it('should add a new rectangle', () => {
      const { addShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes[rectangle.id]).toEqual(rectangle)
    })

    it('should add a new circle', () => {
      const { addShape } = useShapeStore.getState()
      const circle = createTestCircle()
      
      addShape(circle)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes[circle.id]).toEqual(circle)
    })

    it('should add multiple shapes', () => {
      const { addShape } = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1' })
      const rectangle2 = createTestRectangle({ id: 'rectangle2', x: 200 })
      const circle1 = createTestCircle({ id: 'circle1', x: 300 })
      
      addShape(rectangle1)
      addShape(rectangle2)
      addShape(circle1)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(3)
    })

    it('should overwrite shape with same id', () => {
      const { addShape } = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1', x: 100 })
      const rectangle2 = createTestRectangle({ id: 'rectangle1', x: 200 })
      
      addShape(rectangle1)
      addShape(rectangle2)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes['rectangle1'].x).toBe(200)
    })
  })

  describe('updateShape', () => {
    it('should update rectangle position', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      updateShape(rectangle.id, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].x).toBe(300)
      expect(state.shapes[rectangle.id].y).toBe(400)
    })

    it('should update circle position', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const circle = createTestCircle()
      
      addShape(circle)
      updateShape(circle.id, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[circle.id].x).toBe(300)
      expect(state.shapes[circle.id].y).toBe(400)
    })

    it('should update rectangle dimensions', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      updateShape(rectangle.id, { width: 500, height: 600 })
      
      const state = useShapeStore.getState()
      const updatedRect = state.shapes[rectangle.id] as RectangleShape
      expect(updatedRect.width).toBe(500)
      expect(updatedRect.height).toBe(600)
    })

    it('should update circle dimensions', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const circle = createTestCircle()
      
      addShape(circle)
      updateShape(circle.id, { radiusX: 250, radiusY: 300 })
      
      const state = useShapeStore.getState()
      const updatedCircle = state.shapes[circle.id] as CircleShape
      expect(updatedCircle.radiusX).toBe(250)
      expect(updatedCircle.radiusY).toBe(300)
    })

    it('should update shape color', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      updateShape(rectangle.id, { color: '#00ff00' })
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].color).toBe('#00ff00')
    })

    it('should update multiple properties at once', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      updateShape(rectangle.id, {
        x: 500,
        y: 600,
        width: 300,
        height: 400,
        color: '#0000ff',
      })
      
      const state = useShapeStore.getState()
      const updatedRect = state.shapes[rectangle.id] as RectangleShape
      expect(updatedRect.x).toBe(500)
      expect(updatedRect.y).toBe(600)
      expect(updatedRect.width).toBe(300)
      expect(updatedRect.height).toBe(400)
      expect(updatedRect.color).toBe('#0000ff')
    })

    it('should not affect other shapes', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1', x: 100 })
      const rectangle2 = createTestRectangle({ id: 'rectangle2', x: 200 })
      
      addShape(rectangle1)
      addShape(rectangle2)
      
      updateShape('rectangle1', { x: 500, y: 600 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['rectangle1'].x).toBe(500)
      expect(state.shapes['rectangle1'].y).toBe(600)
      expect(state.shapes['rectangle2'].x).toBe(200) // Unchanged
    })
  })

  describe('removeShape', () => {
    it('should remove a rectangle', () => {
      const { addShape, removeShape } = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      addShape(rectangle)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      removeShape(rectangle.id)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })

    it('should remove a circle', () => {
      const { addShape, removeShape } = useShapeStore.getState()
      const circle = createTestCircle()
      
      addShape(circle)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      removeShape(circle.id)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })

    it('should only remove specified shape', () => {
      const { addShape, removeShape } = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1' })
      const rectangle2 = createTestRectangle({ id: 'rectangle2' })
      const circle1 = createTestCircle({ id: 'circle1' })
      
      addShape(rectangle1)
      addShape(rectangle2)
      addShape(circle1)
      
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(3)
      
      removeShape('rectangle1')
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(2)
      expect(state.shapes['rectangle1']).toBeUndefined()
      expect(state.shapes['rectangle2']).toBeDefined()
      expect(state.shapes['circle1']).toBeDefined()
    })
  })

  describe('clearShapes', () => {
    it('should remove all shapes', () => {
      const { addShape, clearShapes } = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1' })
      const rectangle2 = createTestRectangle({ id: 'rectangle2' })
      const circle1 = createTestCircle({ id: 'circle1' })
      
      addShape(rectangle1)
      addShape(rectangle2)
      addShape(circle1)
      
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(3)
      
      clearShapes()
      
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle complete shape lifecycle', () => {
      const store = useShapeStore.getState()
      
      // Add shape
      const rectangle = createTestRectangle()
      store.addShape(rectangle)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      // Update shape
      store.updateShape(rectangle.id, { x: 200, y: 300 })
      expect(useShapeStore.getState().shapes[rectangle.id].x).toBe(200)
      
      // Lock shape
      store.lockShape(rectangle.id, 'user123')
      expect(useShapeStore.getState().shapes[rectangle.id].lockedBy).toBe('user123')
      
      // Unlock shape
      store.unlockShape(rectangle.id)
      expect(useShapeStore.getState().shapes[rectangle.id].lockedBy).toBeNull()
      
      // Remove shape
      store.removeShape(rectangle.id)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })

    it('should handle multiple users editing different shapes', () => {
      const store = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle1', createdBy: 'user1' })
      const circle1 = createTestCircle({ id: 'circle1', createdBy: 'user2' })
      
      store.addShape(rectangle1)
      store.addShape(circle1)
      
      // User 1 updates their rectangle
      store.updateShape('rectangle1', { x: 200, lockedBy: 'user1' })
      
      // User 2 updates their circle
      store.updateShape('circle1', { x: 300, lockedBy: 'user2' })
      
      const state = useShapeStore.getState()
      expect(state.shapes['rectangle1'].x).toBe(200)
      expect(state.shapes['rectangle1'].lockedBy).toBe('user1')
      expect(state.shapes['circle1'].x).toBe(300)
      expect(state.shapes['circle1'].lockedBy).toBe('user2')
    })

    it('should handle rapid shape updates', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      
      for (let i = 0; i < 100; i++) {
        store.updateShape(rectangle.id, { x: i, y: i })
      }
      
      const finalState = useShapeStore.getState()
      expect(finalState.shapes[rectangle.id].x).toBe(99)
      expect(finalState.shapes[rectangle.id].y).toBe(99)
    })
  })

  describe('Shape Locking', () => {
    beforeEach(() => {
      useShapeStore.getState().clearShapes()
    })

    it('should lock a rectangle', () => {
      const rectangle = createTestRectangle()
      useShapeStore.getState().addShape(rectangle)
      
      useShapeStore.getState().lockShape(rectangle.id, 'user123')
      
      const lockedShape = useShapeStore.getState().shapes[rectangle.id]
      expect(lockedShape.lockedBy).toBe('user123')
    })

    it('should lock a circle', () => {
      const circle = createTestCircle()
      useShapeStore.getState().addShape(circle)
      
      useShapeStore.getState().lockShape(circle.id, 'user123')
      
      const lockedShape = useShapeStore.getState().shapes[circle.id]
      expect(lockedShape.lockedBy).toBe('user123')
    })

    it('should unlock a rectangle', () => {
      const rectangle = createTestRectangle()
      useShapeStore.getState().addShape(rectangle)
      useShapeStore.getState().lockShape(rectangle.id, 'user123')
      
      useShapeStore.getState().unlockShape(rectangle.id)
      
      const unlockedShape = useShapeStore.getState().shapes[rectangle.id]
      expect(unlockedShape.lockedBy).toBeNull()
    })

    it('should unlock a circle', () => {
      const circle = createTestCircle()
      useShapeStore.getState().addShape(circle)
      useShapeStore.getState().lockShape(circle.id, 'user123')
      
      useShapeStore.getState().unlockShape(circle.id)
      
      const unlockedShape = useShapeStore.getState().shapes[circle.id]
      expect(unlockedShape.lockedBy).toBeNull()
    })

    it('should not lock a non-existent shape', () => {
      useShapeStore.getState().lockShape('non-existent', 'user123')
      
      const shapes = useShapeStore.getState().shapes
      expect(shapes['non-existent']).toBeUndefined()
    })

    it('should maintain other shape properties when locking', () => {
      const rectangle = createTestRectangle()
      useShapeStore.getState().addShape(rectangle)
      
      useShapeStore.getState().lockShape(rectangle.id, 'user123')
      
      const lockedShape = useShapeStore.getState().shapes[rectangle.id]
      expect(lockedShape.x).toBe(rectangle.x)
      expect(lockedShape.y).toBe(rectangle.y)
      if (lockedShape.type === 'rectangle' && rectangle.type === 'rectangle') {
        expect(lockedShape.width).toBe(rectangle.width)
        expect(lockedShape.height).toBe(rectangle.height)
      }
      expect(lockedShape.color).toBe(rectangle.color)
    })
  })

  describe('Set Shapes', () => {
    beforeEach(() => {
      useShapeStore.getState().clearShapes()
    })

    it('should set shapes from Firestore sync', () => {
      const rectangle1 = createTestRectangle({ id: 'rectangle1' })
      const circle1 = createTestCircle({ id: 'circle1' })
      
      useShapeStore.getState().setShapes({
        [rectangle1.id]: rectangle1,
        [circle1.id]: circle1,
      })
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(2)
      expect(state.shapes[rectangle1.id]).toEqual(rectangle1)
      expect(state.shapes[circle1.id]).toEqual(circle1)
    })

    it('should replace existing shapes when setting', () => {
      const oldRectangle = createTestRectangle({ id: 'oldshape' })
      useShapeStore.getState().addShape(oldRectangle)
      
      const newRectangle = createTestRectangle({ id: 'newshape' })
      const newCircle = createTestCircle({ id: 'newcircle' })
      
      useShapeStore.getState().setShapes({
        [newRectangle.id]: newRectangle,
        [newCircle.id]: newCircle,
      })
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(2)
      expect(state.shapes['oldshape']).toBeUndefined()
      expect(state.shapes[newRectangle.id]).toEqual(newRectangle)
      expect(state.shapes[newCircle.id]).toEqual(newCircle)
    })

    it('should handle empty shapes object', () => {
      const rectangle = createTestRectangle()
      useShapeStore.getState().addShape(rectangle)
      
      useShapeStore.getState().setShapes({})
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(0)
    })
  })
})