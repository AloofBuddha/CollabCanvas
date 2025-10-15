import { create } from 'zustand'
import { ShapeState, Shape } from '../types'

/**
 * Shape Store
 * 
 * Manages all shapes on the canvas with CRUD operations.
 * Shapes are stored in a dictionary keyed by their ID for efficient lookups.
 */

const useShapeStore = create<ShapeState>((set) => ({
  // Initial state - shapes stored as a dictionary
  shapes: {},

  // Add a new shape
  addShape: (shape) => {
    set((state) => ({
      shapes: {
        ...state.shapes,
        [shape.id]: shape,
      },
    }))
  },

  // Update an existing shape with partial updates
  updateShape: (id, updates) => {
    set((state) => {
      const existingShape = state.shapes[id]
      if (!existingShape) return state

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...existingShape,
            ...updates,
          } as Shape,
        },
      }
    })
  },

  // Remove a shape
  removeShape: (id) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = state.shapes
      return { shapes: rest }
    })
  },

  // Lock a shape (set lockedBy to userId)
  lockShape: (id, userId) => {
    set((state) => {
      const existingShape = state.shapes[id]
      if (!existingShape) return state

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...existingShape,
            lockedBy: userId,
          },
        },
      }
    })
  },

  // Unlock a shape (clear lockedBy)
  unlockShape: (id) => {
    set((state) => {
      const existingShape = state.shapes[id]
      if (!existingShape) return state

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...existingShape,
            lockedBy: null,
          },
        },
      }
    })
  },

  // Set all shapes (for syncing from Firestore)
  setShapes: (shapes) => {
    set({ shapes })
  },

  // Clear all shapes
  clearShapes: () => {
    set({ shapes: {} })
  },
}))

export default useShapeStore

