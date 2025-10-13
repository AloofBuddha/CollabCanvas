import { create } from 'zustand'
import { CursorState } from '../types'

/**
 * Cursor Store
 * 
 * Manages local and remote cursor positions for real-time collaboration.
 * - localCursor: Current user's cursor position
 * - remoteCursors: Other users' cursor positions with their metadata
 */

const useCursorStore = create<CursorState>((set) => ({
  // Initial state
  localCursor: { x: 0, y: 0 },
  remoteCursors: {},

  // Update local cursor position
  setLocalCursor: (cursor) => {
    set({ localCursor: cursor })
  },

  // Set or update a remote cursor
  setRemoteCursor: (userId, cursor) => {
    set((state) => ({
      remoteCursors: {
        ...state.remoteCursors,
        [userId]: cursor,
      },
    }))
  },

  // Remove a specific remote cursor (e.g., when user disconnects)
  removeRemoteCursor: (userId) => {
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: _, ...rest } = state.remoteCursors
      return { remoteCursors: rest }
    })
  },

  // Clear all remote cursors
  clearRemoteCursors: () => {
    set({ remoteCursors: {} })
  },
}))

export default useCursorStore

