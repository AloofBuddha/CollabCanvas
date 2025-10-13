import { create } from 'zustand'
import { UserState } from '../types'

/**
 * User Store
 * 
 * Manages user authentication state, profile information, and online status.
 * This store is the source of truth for the current user's identity and auth state.
 */

const useUserStore = create<UserState>((set) => ({
  // Initial state
  userId: null,
  displayName: '',
  color: '#000000',
  online: false,
  authStatus: 'loading',

  // Set user information (called after successful authentication)
  setUser: (userId: string, displayName: string, color: string) => {
    set({
      userId,
      displayName,
      color,
      online: true,
      authStatus: 'authenticated',
    })
  },

  // Update authentication status
  setAuthStatus: (status) => {
    set({ authStatus: status })
  },

  // Update online status
  setOnline: (online) => {
    set({ online })
  },

  // Logout and reset to initial state
  logout: () => {
    set({
      userId: null,
      displayName: '',
      color: '#000000',
      online: false,
      authStatus: 'unauthenticated',
    })
  },
}))

export default useUserStore

