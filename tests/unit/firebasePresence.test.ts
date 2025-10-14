import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase functions
vi.mock('firebase/database', () => ({
  ref: vi.fn((_db, path) => ({ _path: path })),
  set: vi.fn(() => Promise.resolve()),
  onValue: vi.fn(() => {
    // Return unsubscribe function
    return vi.fn()
  }),
  onDisconnect: vi.fn(() => ({
    set: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
  })),
  serverTimestamp: vi.fn(() => ({ '.sv': 'timestamp' })),
  get: vi.fn(() => Promise.resolve({
    exists: () => false,
    val: () => null,
  })),
}))

vi.mock('../../src/utils/firebase', () => ({
  rtdb: { _mock: 'rtdb' },
}))

import { ref, set, onValue, onDisconnect } from 'firebase/database'
import {
  initCursorSync,
  listenToRemoteCursors,
  initUserPresence,
  listenToOnlineUsers,
} from '../../src/utils/firebasePresence'

describe('firebasePresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initCursorSync', () => {
    it('should set up cursor reference and disconnect handler', () => {
      const userId = 'user123'
      const displayName = 'John Doe'
      const color = '#ff0000'

      const updateCursor = initCursorSync(userId, displayName, color)

      // Should create reference to cursors path
      expect(ref).toHaveBeenCalledWith(expect.anything(), `cursors/${userId}`)

      // Should set up disconnect handler
      expect(onDisconnect).toHaveBeenCalled()

      // Should return a function
      expect(typeof updateCursor).toBe('function')
    })

    it('should return function that updates cursor position', () => {
      const updateCursor = initCursorSync('user123', 'John', '#ff0000')

      updateCursor({ x: 100, y: 200 })

      // Should call set with cursor data
      expect(set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          x: 100,
          y: 200,
          name: 'John',
          color: '#ff0000',
        })
      )
    })
  })

  describe('listenToRemoteCursors', () => {
    it('should set up listener and return unsubscribe function', () => {
      const callback = vi.fn()
      const currentUserId = 'user123'

      const unsubscribe = listenToRemoteCursors(currentUserId, callback)

      // Should create reference to cursors path
      expect(ref).toHaveBeenCalledWith(expect.anything(), 'cursors')

      // Should set up listener
      expect(onValue).toHaveBeenCalled()

      // Should return unsubscribe function
      expect(typeof unsubscribe).toBe('function')
    })

    it('should filter out current user from remote cursors', () => {
      const callback = vi.fn()
      const currentUserId = 'user123'

      // Mock onValue to simulate Firebase data
      vi.mocked(onValue).mockImplementation((_ref, cb) => {
        // Simulate Firebase calling our callback with data
        const mockData = {
          user123: { x: 10, y: 20, name: 'Me', color: '#ff0000' },
          user456: { x: 30, y: 40, name: 'Other', color: '#00ff00' },
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cb({ val: () => mockData } as any)
        return vi.fn()
      })

      listenToRemoteCursors(currentUserId, callback)

      // Should call callback with only remote cursors (not current user)
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          user456: expect.objectContaining({
            userId: 'user456',
            name: 'Other',
            color: '#00ff00',
          }),
        })
      )

      // Should not include current user
      expect(callback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          user123: expect.anything(),
        })
      )
    })

    it('should handle empty cursor data', () => {
      const callback = vi.fn()

      vi.mocked(onValue).mockImplementation((_ref, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cb({ val: () => null } as any)
        return vi.fn()
      })

      listenToRemoteCursors('user123', callback)

      expect(callback).toHaveBeenCalledWith({})
    })
  })

  describe('initUserPresence', () => {
    it('should set up presence with connection listener and assign color', async () => {
      const userId = 'user123'
      const displayName = 'John Doe'

      const result = await initUserPresence(userId, displayName)

      // Should create references
      expect(ref).toHaveBeenCalledWith(expect.anything(), `presence/${userId}`)
      expect(ref).toHaveBeenCalledWith(expect.anything(), '.info/connected')

      // Should set up connection listener
      expect(onValue).toHaveBeenCalled()

      // Should return unsubscribe function and color
      expect(typeof result.unsubscribe).toBe('function')
      expect(typeof result.color).toBe('string')
      expect(result.color).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('should set up disconnect handler when connected', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(onValue).mockImplementation((ref: any, callback) => {
        // Simulate being connected
        if (ref._path === '.info/connected') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback({ val: () => true } as any)
        }
        return vi.fn()
      })

      await initUserPresence('user123', 'John')

      // Should set up disconnect handler
      expect(onDisconnect).toHaveBeenCalled()
    })

    it('should not set presence when disconnected', async () => {
      const setMock = vi.mocked(set)
      setMock.mockClear()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(onValue).mockImplementation((ref: any, callback) => {
        // Simulate being disconnected
        if (ref._path === '.info/connected') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback({ val: () => false } as any)
        }
        return vi.fn()
      })

      await initUserPresence('user123', 'John')

      // Should not call set when disconnected
      expect(setMock).not.toHaveBeenCalled()
    })
  })

  describe('listenToOnlineUsers', () => {
    it('should set up listener for presence data', () => {
      const callback = vi.fn()

      listenToOnlineUsers(callback)

      // Should create reference to presence path
      expect(ref).toHaveBeenCalledWith(expect.anything(), 'presence')

      // Should set up listener
      expect(onValue).toHaveBeenCalled()
    })

    it('should call callback with user data', () => {
      const callback = vi.fn()

      vi.mocked(onValue).mockImplementation((_ref, cb) => {
        // Mock data only contains online users (offline users are removed from presence)
        const mockData = {
          user123: {
            displayName: 'John',
            color: '#ff0000',
          },
          user456: {
            displayName: 'Jane',
            color: '#00ff00',
          },
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cb({ val: () => mockData } as any)
        return vi.fn()
      })

      listenToOnlineUsers(callback)

      expect(callback).toHaveBeenCalledWith([
        {
          userId: 'user123',
          displayName: 'John',
          color: '#ff0000',
        },
        {
          userId: 'user456',
          displayName: 'Jane',
          color: '#00ff00',
        },
      ])
    })

    it('should handle empty presence data', () => {
      const callback = vi.fn()

      vi.mocked(onValue).mockImplementation((_ref, cb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cb({ val: () => null } as any)
        return vi.fn()
      })

      listenToOnlineUsers(callback)

      expect(callback).toHaveBeenCalledWith([])
    })
  })
})

