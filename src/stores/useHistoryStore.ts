import { create } from 'zustand'
import { Shape } from '../types'

/**
 * History Store for Undo/Redo
 * 
 * Tracks state history for undo/redo functionality.
 * Stores snapshots of the shapes dictionary.
 */

interface HistoryState {
  past: Record<string, Shape>[]
  present: Record<string, Shape> | null
  future: Record<string, Shape>[]
  
  // Push current state to history before making changes
  pushState: (shapes: Record<string, Shape>) => void
  
  // Undo - restore previous state
  undo: () => Record<string, Shape> | null
  
  // Redo - restore next state
  redo: () => Record<string, Shape> | null
  
  // Clear history (useful when loading from server)
  clearHistory: () => void
  
  // Check if undo/redo are available
  canUndo: () => boolean
  canRedo: () => boolean
}

const MAX_HISTORY = 50 // Limit history to prevent memory issues

const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  pushState: (shapes) => {
    set((state) => {
      // If present is null (first time), just set it
      if (state.present === null) {
        return { present: shapes }
      }
      
      // Otherwise, push current present to past and set new present
      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY), // Keep last 50 states
        present: shapes,
        future: [], // Clear redo stack when new action is performed
      }
    })
  },

  undo: () => {
    const { past, present, future } = get()
    
    if (past.length === 0 || present === null) return null
    
    // Get the previous state from past
    const previous = past[past.length - 1]
    const newPast = past.slice(0, -1)
    
    // Move current present to future
    set({
      past: newPast,
      present: previous,
      future: [present, ...future],
    })
    
    return previous
  },

  redo: () => {
    const { past, present, future } = get()
    
    if (future.length === 0 || present === null) return null
    
    // Get the next state from future
    const next = future[0]
    const newFuture = future.slice(1)
    
    // Move current present to past
    set({
      past: [...past, present],
      present: next,
      future: newFuture,
    })
    
    return next
  },

  clearHistory: () => {
    set({ past: [], present: null, future: [] })
  },

  canUndo: () => {
    return get().past.length > 0
  },

  canRedo: () => {
    return get().future.length > 0
  },
}))

export default useHistoryStore

