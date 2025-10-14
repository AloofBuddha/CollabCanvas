import { describe, it, expect, beforeEach } from 'vitest'
import useShapeStore from '../../src/stores/useShapeStore'
import { Shape } from '../../src/types'

describe('useShapeStore', () => {
  // Helper function to create a test shape
  const createTestShape = (overrides?: Partial<Shape>): Shape => ({
    id: 'shape1',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#ff5733',
    createdBy: 'user1',
    ...overrides,
  })

  beforeEach(() => {
    // Reset store to initial state before each test
    useShapeStore.getState().clearShapes()
  })

  describe('Initial State', () => {
    it('should have empty shapes object initially', () => {
      const state = useShapeStore.getState()
      
      expect(state.shapes).toEqual({})
      expect(Object.keys(state.shapes)).toHaveLength(0)
    })
  })

  describe('addShape', () => {
    it('should add a new shape', () => {
      const { addShape } = useShapeStore.getState()
      const shape = createTestShape()
      
      addShape(shape)
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1']).toEqual(shape)
      expect(Object.keys(state.shapes)).toHaveLength(1)
    })

    it('should add multiple shapes', () => {
      const { addShape } = useShapeStore.getState()
      
      addShape(createTestShape({ id: 'shape1' }))
      addShape(createTestShape({ id: 'shape2', x: 200 }))
      addShape(createTestShape({ id: 'shape3', x: 300 }))
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(3)
      expect(state.shapes['shape1']).toBeDefined()
      expect(state.shapes['shape2']).toBeDefined()
      expect(state.shapes['shape3']).toBeDefined()
    })

    it('should overwrite shape with same id', () => {
      const { addShape } = useShapeStore.getState()
      
      addShape(createTestShape({ id: 'shape1', x: 100 }))
      addShape(createTestShape({ id: 'shape1', x: 200 }))
      
      const state = useShapeStore.getState()
      expect(Object.keys(state.shapes)).toHaveLength(1)
      expect(state.shapes['shape1'].x).toBe(200)
    })
  })

  describe('updateShape', () => {
    it('should update shape position', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      addShape(createTestShape())
      updateShape('shape1', { x: 300, y: 400 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].x).toBe(300)
      expect(state.shapes['shape1'].y).toBe(400)
      expect(state.shapes['shape1'].width).toBe(200) // Other props unchanged
    })

    it('should update shape dimensions', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      addShape(createTestShape())
      updateShape('shape1', { width: 500, height: 600 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].width).toBe(500)
      expect(state.shapes['shape1'].height).toBe(600)
    })

    it('should update shape color', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      addShape(createTestShape())
      updateShape('shape1', { color: '#00ff00' })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].color).toBe('#00ff00')
    })

    it('should update multiple properties at once', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      addShape(createTestShape())
      updateShape('shape1', {
        x: 500,
        y: 600,
        width: 300,
        height: 400,
        color: '#0000ff',
      })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].x).toBe(500)
      expect(state.shapes['shape1'].y).toBe(600)
      expect(state.shapes['shape1'].width).toBe(300)
      expect(state.shapes['shape1'].height).toBe(400)
      expect(state.shapes['shape1'].color).toBe('#0000ff')
    })

    it('should not affect other shapes', () => {
      const { addShape, updateShape } = useShapeStore.getState()
      
      addShape(createTestShape({ id: 'shape1', x: 100 }))
      addShape(createTestShape({ id: 'shape2', x: 200 }))
      
      updateShape('shape1', { x: 300 })
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].x).toBe(300)
      expect(state.shapes['shape2'].x).toBe(200)
    })

    it('should handle updating non-existent shape gracefully', () => {
      const { updateShape } = useShapeStore.getState()
      
      // Should not throw error
      expect(() => updateShape('nonexistent', { x: 100 })).not.toThrow()
      
      const state = useShapeStore.getState()
      expect(state.shapes['nonexistent']).toBeUndefined()
    })
  })

  describe('removeShape', () => {
    it('should remove a shape', () => {
      const { addShape, removeShape } = useShapeStore.getState()
      
      addShape(createTestShape())
      removeShape('shape1')
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1']).toBeUndefined()
      expect(Object.keys(state.shapes)).toHaveLength(0)
    })

    it('should only remove specified shape', () => {
      const { addShape, removeShape } = useShapeStore.getState()
      
      addShape(createTestShape({ id: 'shape1' }))
      addShape(createTestShape({ id: 'shape2' }))
      addShape(createTestShape({ id: 'shape3' }))
      
      removeShape('shape2')
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1']).toBeDefined()
      expect(state.shapes['shape2']).toBeUndefined()
      expect(state.shapes['shape3']).toBeDefined()
      expect(Object.keys(state.shapes)).toHaveLength(2)
    })

    it('should handle removing non-existent shape', () => {
      const { removeShape } = useShapeStore.getState()
      
      // Should not throw error
      expect(() => removeShape('nonexistent')).not.toThrow()
      
      const state = useShapeStore.getState()
      expect(state.shapes).toEqual({})
    })
  })


  describe('clearShapes', () => {
    it('should remove all shapes', () => {
      const { addShape, clearShapes } = useShapeStore.getState()
      
      addShape(createTestShape({ id: 'shape1' }))
      addShape(createTestShape({ id: 'shape2' }))
      addShape(createTestShape({ id: 'shape3' }))
      
      clearShapes()
      
      const state = useShapeStore.getState()
      expect(state.shapes).toEqual({})
      expect(Object.keys(state.shapes)).toHaveLength(0)
    })

    it('should work when no shapes exist', () => {
      const { clearShapes } = useShapeStore.getState()
      
      // Should not throw error
      expect(() => clearShapes()).not.toThrow()
      
      const state = useShapeStore.getState()
      expect(state.shapes).toEqual({})
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle complete shape lifecycle', () => {
      const store = useShapeStore.getState()
      
      // Add shape
      store.addShape(createTestShape())
      expect(Object.keys(useShapeStore.getState().shapes)).toHaveLength(1)
      
      // Update shape
      store.updateShape('shape1', { x: 300, y: 400 })
      expect(useShapeStore.getState().shapes['shape1'].x).toBe(300)
      
      // Remove shape
      store.removeShape('shape1')
      expect(useShapeStore.getState().shapes['shape1']).toBeUndefined()
    })

    it('should handle multiple users editing different shapes', () => {
      const store = useShapeStore.getState()
      
      store.addShape(createTestShape({ id: 'shape1', createdBy: 'user1' }))
      store.addShape(createTestShape({ id: 'shape2', createdBy: 'user2' }))
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].createdBy).toBe('user1')
      expect(state.shapes['shape2'].createdBy).toBe('user2')
    })

    it('should handle rapid shape updates', () => {
      const store = useShapeStore.getState()
      
      store.addShape(createTestShape())
      
      for (let i = 0; i < 100; i++) {
        store.updateShape('shape1', { x: i, y: i * 2 })
      }
      
      const state = useShapeStore.getState()
      expect(state.shapes['shape1'].x).toBe(99)
      expect(state.shapes['shape1'].y).toBe(198)
    })
  })
})

