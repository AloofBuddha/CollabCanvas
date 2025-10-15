import { describe, it, expect, beforeEach } from 'vitest'
import useShapeStore from '../../src/stores/useShapeStore'
import { RectangleShape, CircleShape } from '../../src/types'

/**
 * Canvas interaction tests
 * 
 * These tests verify the logic for shape creation, dragging, and locking.
 * They don't test Konva directly, but rather the store interactions.
 */

describe('Canvas Shape Interactions', () => {
  const userId = 'test-user-1'
  
  const createTestRectangle = (overrides?: Partial<RectangleShape>): RectangleShape => ({
    id: 'test-rectangle-1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#ff5733',
    createdBy: userId,
    ...overrides,
  })

  const createTestCircle = (overrides?: Partial<CircleShape>): CircleShape => ({
    id: 'test-circle-1',
    type: 'circle',
    x: 100,
    y: 100,
    radiusX: 100,
    radiusY: 75,
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
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes[rectangle.id]).toEqual(rectangle)
    })

    it('should normalize negative dimensions', () => {
      // Simulate drag from bottom-right to top-left
      const rectangle = createTestRectangle({
        x: 200,
        y: 200,
        width: -100,
        height: -100,
      })

      // Normalize before adding
      const normalized: RectangleShape = {
        ...rectangle,
        x: rectangle.x + rectangle.width,
        y: rectangle.y + rectangle.height,
        width: Math.abs(rectangle.width),
        height: Math.abs(rectangle.height),
      }

      useShapeStore.getState().addShape(normalized)
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].x).toBe(100)
      expect(state.shapes[rectangle.id].y).toBe(100)
      const rectShape = state.shapes[rectangle.id] as RectangleShape
      expect(rectShape.width).toBe(100)
      expect(rectShape.height).toBe(100)
    })

    it('should create rectangle with user color', () => {
      const userColor = '#123456'
      const rectangle = createTestRectangle({ color: userColor })
      
      useShapeStore.getState().addShape(rectangle)
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].color).toBe(userColor)
    })
  })

  describe('Circle Creation', () => {
    it('should add circle to store when created', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes[circle.id]).toEqual(circle)
    })

    it('should normalize negative radii', () => {
      // Simulate drag from bottom-right to top-left
      const circle = createTestCircle({
        x: 200,
        y: 200,
        radiusX: -50,
        radiusY: -50,
      })

      // Normalize before adding
      const normalized: CircleShape = {
        ...circle,
        x: circle.x + circle.radiusX * 2,
        y: circle.y + circle.radiusY * 2,
        radiusX: Math.abs(circle.radiusX),
        radiusY: Math.abs(circle.radiusY),
      }

      useShapeStore.getState().addShape(normalized)
      
      const state = useShapeStore.getState()
      expect(state.shapes[circle.id].x).toBe(100)
      expect(state.shapes[circle.id].y).toBe(100)
      const circleShape = state.shapes[circle.id] as CircleShape
      expect(circleShape.radiusX).toBe(50)
      expect(circleShape.radiusY).toBe(50)
    })

    it('should create circle with user color', () => {
      const userColor = '#123456'
      const circle = createTestCircle({ color: userColor })
      
      useShapeStore.getState().addShape(circle)
      
      const state = useShapeStore.getState()
      expect(state.shapes[circle.id].color).toBe(userColor)
    })
  })

  describe('Rectangle Dragging', () => {
    it('should update rectangle position during drag', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      store.updateShape(rectangle.id, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].x).toBe(300)
      expect(state.shapes[rectangle.id].y).toBe(400)
    })
  })

  describe('Circle Dragging', () => {
    it('should update circle position during drag', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      store.updateShape(circle.id, { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes[circle.id].x).toBe(300)
      expect(state.shapes[circle.id].y).toBe(400)
    })
  })

  describe('Multiple Shapes', () => {
    it('should handle multiple rectangles independently', () => {
      const store = useShapeStore.getState()
      
      const rectangle1 = createTestRectangle({ id: 'rectangle-1', x: 100 })
      const rectangle2 = createTestRectangle({ id: 'rectangle-2', x: 200 })
      const rectangle3 = createTestRectangle({ id: 'rectangle-3', x: 300 })
      
      store.addShape(rectangle1)
      store.addShape(rectangle2)
      store.addShape(rectangle3)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(3)
    })

    it('should handle multiple circles independently', () => {
      const store = useShapeStore.getState()
      
      const circle1 = createTestCircle({ id: 'circle-1', x: 100 })
      const circle2 = createTestCircle({ id: 'circle-2', x: 200 })
      const circle3 = createTestCircle({ id: 'circle-3', x: 300 })
      
      store.addShape(circle1)
      store.addShape(circle2)
      store.addShape(circle3)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(3)
    })

    it('should handle mixed rectangle and circle shapes', () => {
      const store = useShapeStore.getState()
      
      const rectangle = createTestRectangle({ id: 'rectangle-1', x: 100 })
      const circle = createTestCircle({ id: 'circle-1', x: 200 })
      
      store.addShape(rectangle)
      store.addShape(circle)
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(2)
      expect(state.shapes[rectangle.id].type).toBe('rectangle')
      expect(state.shapes[circle.id].type).toBe('circle')
    })
  })

  describe('Shape Updates', () => {
    it('should update rectangle properties', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      store.updateShape(rectangle.id, { 
        x: 500, 
        y: 600, 
        width: 300, 
        height: 400, 
        color: '#0000ff' 
      })
      
      const state = useShapeStore.getState()
      const updatedRect = state.shapes[rectangle.id] as RectangleShape
      expect(updatedRect.x).toBe(500)
      expect(updatedRect.y).toBe(600)
      expect(updatedRect.width).toBe(300)
      expect(updatedRect.height).toBe(400)
      expect(updatedRect.color).toBe('#0000ff')
    })

    it('should update circle properties', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      store.updateShape(circle.id, { 
        x: 500, 
        y: 600, 
        radiusX: 150, 
        radiusY: 200, 
        color: '#0000ff' 
      })
      
      const state = useShapeStore.getState()
      const updatedCircle = state.shapes[circle.id] as CircleShape
      expect(updatedCircle.x).toBe(500)
      expect(updatedCircle.y).toBe(600)
      expect(updatedCircle.radiusX).toBe(150)
      expect(updatedCircle.radiusY).toBe(200)
      expect(updatedCircle.color).toBe('#0000ff')
    })
  })

  describe('Shape Deletion', () => {
    it('should remove rectangle from store', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      store.removeShape(rectangle.id)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })

    it('should remove circle from store', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      store.removeShape(circle.id)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small rectangles', () => {
      const rectangle = createTestRectangle({ width: 5, height: 5 })
      
      useShapeStore.getState().addShape(rectangle)
      
      const state = useShapeStore.getState()
      const rectShape = state.shapes[rectangle.id] as RectangleShape
      expect(rectShape.width).toBe(5)
      expect(rectShape.height).toBe(5)
    })

    it('should handle very small circles', () => {
      const circle = createTestCircle({ radiusX: 2.5, radiusY: 2.5 })
      
      useShapeStore.getState().addShape(circle)
      
      const state = useShapeStore.getState()
      const circleShape = state.shapes[circle.id] as CircleShape
      expect(circleShape.radiusX).toBe(2.5)
      expect(circleShape.radiusY).toBe(2.5)
    })

    it('should handle very large rectangles', () => {
      const rectangle = createTestRectangle({ width: 5000, height: 5000 })
      
      useShapeStore.getState().addShape(rectangle)
      
      const state = useShapeStore.getState()
      const rectShape = state.shapes[rectangle.id] as RectangleShape
      expect(rectShape.width).toBe(5000)
      expect(rectShape.height).toBe(5000)
    })

    it('should handle very large circles', () => {
      const circle = createTestCircle({ radiusX: 2500, radiusY: 2500 })
      
      useShapeStore.getState().addShape(circle)
      
      const state = useShapeStore.getState()
      const circleShape = state.shapes[circle.id] as CircleShape
      expect(circleShape.radiusX).toBe(2500)
      expect(circleShape.radiusY).toBe(2500)
    })

    it('should handle rectangles at canvas boundaries', () => {
      const rectangle = createTestRectangle({ x: 0, y: 0 })
      
      useShapeStore.getState().addShape(rectangle)
      
      const state = useShapeStore.getState()
      expect(state.shapes[rectangle.id].x).toBe(0)
      expect(state.shapes[rectangle.id].y).toBe(0)
    })

    it('should handle circles at canvas boundaries', () => {
      const circle = createTestCircle({ x: 0, y: 0 })
      
      useShapeStore.getState().addShape(circle)
      
      const state = useShapeStore.getState()
      expect(state.shapes[circle.id].x).toBe(0)
      expect(state.shapes[circle.id].y).toBe(0)
    })
  })

  describe('Shape Locking', () => {
    it('should lock rectangle for user', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      store.lockShape(rectangle.id, 'user123')
      
      const lockedRectangle = useShapeStore.getState().shapes[rectangle.id]
      expect(lockedRectangle.lockedBy).toBe('user123')
    })

    it('should lock circle for user', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      store.lockShape(circle.id, 'user123')
      
      const lockedCircle = useShapeStore.getState().shapes[circle.id]
      expect(lockedCircle.lockedBy).toBe('user123')
    })

    it('should unlock rectangle', () => {
      const store = useShapeStore.getState()
      const rectangle = createTestRectangle()
      
      store.addShape(rectangle)
      store.lockShape(rectangle.id, 'user123')
      store.unlockShape(rectangle.id)
      
      const unlockedRectangle = useShapeStore.getState().shapes[rectangle.id]
      expect(unlockedRectangle.lockedBy).toBeNull()
    })

    it('should unlock circle', () => {
      const store = useShapeStore.getState()
      const circle = createTestCircle()
      
      store.addShape(circle)
      store.lockShape(circle.id, 'user123')
      store.unlockShape(circle.id)
      
      const unlockedCircle = useShapeStore.getState().shapes[circle.id]
      expect(unlockedCircle.lockedBy).toBeNull()
    })
  })

  describe('Shape Replacement', () => {
    it('should replace all shapes with new set', () => {
      const store = useShapeStore.getState()
      
      // Add initial shapes
      const rectangle1 = createTestRectangle({ id: 'rectangle-1', x: 100, y: 100 })
      const circle1 = createTestCircle({ id: 'circle-1', x: 200, y: 200 })
      
      store.addShape(rectangle1)
      store.addShape(circle1)
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(2)
      
      // Replace with new set
      const rectangle2 = createTestRectangle({ id: 'rectangle-2', x: 300, y: 300 })
      const circle2 = createTestCircle({ id: 'circle-2', x: 400, y: 400 })
      
      store.setShapes({
        [rectangle2.id]: rectangle2,
        [circle2.id]: circle2,
      })
      
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(2)
      expect(useShapeStore.getState().shapes[rectangle2.id]).toEqual(rectangle2)
      expect(useShapeStore.getState().shapes[circle2.id]).toEqual(circle2)
    })
  })
})