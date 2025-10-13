import { describe, it, expect, beforeEach } from 'vitest'
import useCursorStore from '../../src/stores/useCursorStore'

describe('useCursorStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useCursorStore.getState()
    store.clearRemoteCursors()
    store.setLocalCursor({ x: 0, y: 0 })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useCursorStore.getState()
      
      expect(state.localCursor).toEqual({ x: 0, y: 0 })
      expect(state.remoteCursors).toEqual({})
    })
  })

  describe('setLocalCursor', () => {
    it('should update local cursor position', () => {
      const { setLocalCursor } = useCursorStore.getState()
      
      setLocalCursor({ x: 100, y: 200 })
      
      const state = useCursorStore.getState()
      expect(state.localCursor).toEqual({ x: 100, y: 200 })
    })

    it('should handle multiple cursor updates', () => {
      const { setLocalCursor } = useCursorStore.getState()
      
      setLocalCursor({ x: 10, y: 20 })
      expect(useCursorStore.getState().localCursor).toEqual({ x: 10, y: 20 })
      
      setLocalCursor({ x: 30, y: 40 })
      expect(useCursorStore.getState().localCursor).toEqual({ x: 30, y: 40 })
      
      setLocalCursor({ x: 50, y: 60 })
      expect(useCursorStore.getState().localCursor).toEqual({ x: 50, y: 60 })
    })

    it('should handle negative coordinates', () => {
      const { setLocalCursor } = useCursorStore.getState()
      
      setLocalCursor({ x: -100, y: -200 })
      
      expect(useCursorStore.getState().localCursor).toEqual({ x: -100, y: -200 })
    })

    it('should handle decimal coordinates', () => {
      const { setLocalCursor } = useCursorStore.getState()
      
      setLocalCursor({ x: 123.45, y: 678.90 })
      
      expect(useCursorStore.getState().localCursor).toEqual({ x: 123.45, y: 678.90 })
    })
  })

  describe('setRemoteCursor', () => {
    it('should add a new remote cursor', () => {
      const { setRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors['user1']).toEqual({
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
    })

    it('should update existing remote cursor', () => {
      const { setRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      setRemoteCursor('user1', {
        x: 300,
        y: 400,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors['user1']).toEqual({
        x: 300,
        y: 400,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
    })

    it('should handle multiple remote cursors', () => {
      const { setRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      setRemoteCursor('user2', {
        x: 300,
        y: 400,
        userId: 'user2',
        color: '#33ff57',
        name: 'Bob',
      })
      
      const state = useCursorStore.getState()
      expect(Object.keys(state.remoteCursors)).toHaveLength(2)
      expect(state.remoteCursors['user1'].name).toBe('Alice')
      expect(state.remoteCursors['user2'].name).toBe('Bob')
    })

    it('should preserve other cursors when updating one', () => {
      const { setRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      setRemoteCursor('user2', {
        x: 300,
        y: 400,
        userId: 'user2',
        color: '#33ff57',
        name: 'Bob',
      })
      
      setRemoteCursor('user1', {
        x: 500,
        y: 600,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors['user1'].x).toBe(500)
      expect(state.remoteCursors['user2'].x).toBe(300)
    })
  })

  describe('removeRemoteCursor', () => {
    it('should remove a specific remote cursor', () => {
      const { setRemoteCursor, removeRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      removeRemoteCursor('user1')
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors['user1']).toBeUndefined()
      expect(Object.keys(state.remoteCursors)).toHaveLength(0)
    })

    it('should only remove specified cursor, not others', () => {
      const { setRemoteCursor, removeRemoteCursor } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      setRemoteCursor('user2', {
        x: 300,
        y: 400,
        userId: 'user2',
        color: '#33ff57',
        name: 'Bob',
      })
      
      removeRemoteCursor('user1')
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors['user1']).toBeUndefined()
      expect(state.remoteCursors['user2']).toBeDefined()
      expect(state.remoteCursors['user2'].name).toBe('Bob')
    })

    it('should handle removing non-existent cursor', () => {
      const { removeRemoteCursor } = useCursorStore.getState()
      
      // Should not throw error
      expect(() => removeRemoteCursor('nonexistent')).not.toThrow()
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors).toEqual({})
    })
  })

  describe('clearRemoteCursors', () => {
    it('should remove all remote cursors', () => {
      const { setRemoteCursor, clearRemoteCursors } = useCursorStore.getState()
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      setRemoteCursor('user2', {
        x: 300,
        y: 400,
        userId: 'user2',
        color: '#33ff57',
        name: 'Bob',
      })
      
      clearRemoteCursors()
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors).toEqual({})
      expect(Object.keys(state.remoteCursors)).toHaveLength(0)
    })

    it('should not affect local cursor', () => {
      const { setLocalCursor, setRemoteCursor, clearRemoteCursors } = useCursorStore.getState()
      
      setLocalCursor({ x: 50, y: 50 })
      
      setRemoteCursor('user1', {
        x: 100,
        y: 200,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      clearRemoteCursors()
      
      const state = useCursorStore.getState()
      expect(state.localCursor).toEqual({ x: 50, y: 50 })
      expect(state.remoteCursors).toEqual({})
    })

    it('should work when no remote cursors exist', () => {
      const { clearRemoteCursors } = useCursorStore.getState()
      
      // Should not throw error
      expect(() => clearRemoteCursors()).not.toThrow()
      
      const state = useCursorStore.getState()
      expect(state.remoteCursors).toEqual({})
    })
  })

  describe('Cursor Tracking Scenarios', () => {
    it('should handle rapid cursor updates', () => {
      const { setLocalCursor } = useCursorStore.getState()
      
      for (let i = 0; i < 100; i++) {
        setLocalCursor({ x: i, y: i * 2 })
      }
      
      const state = useCursorStore.getState()
      expect(state.localCursor).toEqual({ x: 99, y: 198 })
    })

    it('should handle user join and leave', () => {
      const store = useCursorStore.getState()
      
      // User joins
      store.setRemoteCursor('user1', {
        x: 100,
        y: 100,
        userId: 'user1',
        color: '#ff5733',
        name: 'Alice',
      })
      
      expect(Object.keys(useCursorStore.getState().remoteCursors)).toHaveLength(1)
      
      // User leaves
      store.removeRemoteCursor('user1')
      
      expect(Object.keys(useCursorStore.getState().remoteCursors)).toHaveLength(0)
    })

    it('should handle multiple simultaneous users', () => {
      const { setRemoteCursor } = useCursorStore.getState()
      
      const users = ['user1', 'user2', 'user3', 'user4', 'user5']
      
      users.forEach((userId, index) => {
        setRemoteCursor(userId, {
          x: index * 100,
          y: index * 100,
          userId,
          color: `#${index}${index}${index}${index}${index}${index}`,
          name: `User ${index + 1}`,
        })
      })
      
      const state = useCursorStore.getState()
      expect(Object.keys(state.remoteCursors)).toHaveLength(5)
    })
  })
})

