import { create } from 'zustand'
import { ShapeState } from '../types'

/**
 * Shape Store
 * 
 * Manages all shapes on the canvas with CRUD operations.
 * Shapes are stored in a dictionary keyed by their ID for efficient lookups.
 * Includes locking mechanism to prevent concurrent edits during drag operations.
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
  // Only allows updates if shape is unlocked OR locked by the requesting user
  updateShape: (id, userId, updates) => {
    set((state) => {
      const existingShape = state.shapes[id]
      if (!existingShape) return state

      // If shape is locked, only the user who locked it can update it
      if (existingShape.lockedBy && existingShape.lockedBy !== userId) {
        return state
      }

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...existingShape,
            ...updates,
          },
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

  // Lock a shape during drag (sets lockedBy to userId)
  lockShape: (id, userId) => {
    set((state) => {
      const shape = state.shapes[id]
      if (!shape) return state

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...shape,
            lockedBy: userId,
          },
        },
      }
    })
  },

  // Unlock a shape after drag completes
  unlockShape: (id) => {
    set((state) => {
      const shape = state.shapes[id]
      if (!shape) return state

      return {
        shapes: {
          ...state.shapes,
          [id]: {
            ...shape,
            lockedBy: null,
          },
        },
      }
    })
  },

  // Clear all shapes
  clearShapes: () => {
    set({ shapes: {} })
  },
}))

export default useShapeStore

