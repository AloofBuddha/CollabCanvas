import { describe, it, expect, beforeEach } from 'vitest'
import useUserStore from '../../src/stores/useUserStore'

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUserStore.getState().logout()
    useUserStore.getState().setAuthStatus('loading')
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUserStore.getState()
      
      expect(state.userId).toBeNull()
      expect(state.displayName).toBe('')
      expect(state.color).toBe('#000000')
      expect(state.online).toBe(false)
      expect(state.authStatus).toBe('loading')
    })
  })

  describe('setUser', () => {
    it('should set user information and mark as authenticated', () => {
      const { setUser } = useUserStore.getState()
      
      setUser('user123', 'John Doe', '#ff5733')
      
      const state = useUserStore.getState()
      expect(state.userId).toBe('user123')
      expect(state.displayName).toBe('John Doe')
      expect(state.color).toBe('#ff5733')
      expect(state.online).toBe(true)
      expect(state.authStatus).toBe('authenticated')
    })

    it('should update user information when called multiple times', () => {
      const { setUser } = useUserStore.getState()
      
      setUser('user1', 'Alice', '#ff0000')
      setUser('user2', 'Bob', '#00ff00')
      
      const state = useUserStore.getState()
      expect(state.userId).toBe('user2')
      expect(state.displayName).toBe('Bob')
      expect(state.color).toBe('#00ff00')
    })
  })

  describe('setAuthStatus', () => {
    it('should update auth status to authenticated', () => {
      const { setAuthStatus } = useUserStore.getState()
      
      setAuthStatus('authenticated')
      
      expect(useUserStore.getState().authStatus).toBe('authenticated')
    })

    it('should update auth status to unauthenticated', () => {
      const { setAuthStatus } = useUserStore.getState()
      
      setAuthStatus('unauthenticated')
      
      expect(useUserStore.getState().authStatus).toBe('unauthenticated')
    })

    it('should update auth status to loading', () => {
      const { setAuthStatus } = useUserStore.getState()
      
      setAuthStatus('loading')
      
      expect(useUserStore.getState().authStatus).toBe('loading')
    })
  })

  describe('setOnline', () => {
    it('should set online status to true', () => {
      const { setOnline } = useUserStore.getState()
      
      setOnline(true)
      
      expect(useUserStore.getState().online).toBe(true)
    })

    it('should set online status to false', () => {
      const { setOnline, setUser } = useUserStore.getState()
      
      setUser('user123', 'John', '#ff5733')
      setOnline(false)
      
      expect(useUserStore.getState().online).toBe(false)
    })

    it('should toggle online status', () => {
      const { setOnline } = useUserStore.getState()
      
      setOnline(true)
      expect(useUserStore.getState().online).toBe(true)
      
      setOnline(false)
      expect(useUserStore.getState().online).toBe(false)
    })
  })

  describe('logout', () => {
    it('should reset all user state to initial values', () => {
      const { setUser, logout } = useUserStore.getState()
      
      // Set user data
      setUser('user123', 'John Doe', '#ff5733')
      
      // Logout
      logout()
      
      const state = useUserStore.getState()
      expect(state.userId).toBeNull()
      expect(state.displayName).toBe('')
      expect(state.color).toBe('#000000')
      expect(state.online).toBe(false)
      expect(state.authStatus).toBe('unauthenticated')
    })

    it('should work when called on initial state', () => {
      const { logout } = useUserStore.getState()
      
      // Should not throw error
      expect(() => logout()).not.toThrow()
      
      const state = useUserStore.getState()
      expect(state.userId).toBeNull()
      expect(state.authStatus).toBe('unauthenticated')
    })
  })

  describe('State Transitions', () => {
    it('should handle complete authentication flow', () => {
      const store = useUserStore.getState()
      
      // Start with loading
      store.setAuthStatus('loading')
      expect(useUserStore.getState().authStatus).toBe('loading')
      
      // Set user (automatically sets authenticated)
      store.setUser('user123', 'John', '#ff5733')
      expect(useUserStore.getState().authStatus).toBe('authenticated')
      expect(useUserStore.getState().online).toBe(true)
      
      // Logout
      store.logout()
      expect(useUserStore.getState().authStatus).toBe('unauthenticated')
      expect(useUserStore.getState().online).toBe(false)
    })

    it('should handle going offline while authenticated', () => {
      const store = useUserStore.getState()
      
      store.setUser('user123', 'John', '#ff5733')
      expect(useUserStore.getState().online).toBe(true)
      
      store.setOnline(false)
      expect(useUserStore.getState().online).toBe(false)
      expect(useUserStore.getState().authStatus).toBe('authenticated')
      expect(useUserStore.getState().userId).toBe('user123')
    })
  })
})

