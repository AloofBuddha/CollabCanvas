import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import useUserStore from '../stores/useUserStore'
import useShapeStore from '../stores/useShapeStore'
import { cleanupUserPresence } from './firebasePresence'
import { unlockUserShapes } from './firebaseShapes'

/**
 * Authentication utilities for Firebase
 */

// Helper to generate a random user color
const generateUserColor = (): string => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33F0',
    '#33FFF0', '#F0FF33', '#FF8C33', '#8C33FF', '#33FF8C',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Sign up a new user
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userId = userCredential.user.uid

    // Generate a color for the user
    const color = generateUserColor()

    // Save user profile to Firestore
    await setDoc(doc(db, 'users', userId), {
      displayName,
      color,
      createdAt: new Date().toISOString(),
    })

    // Update local store
    useUserStore.getState().setUser(userId, displayName, color)

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

/**
 * Sign in an existing user
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userId = userCredential.user.uid

    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId))
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found' }
    }

    const userData = userDoc.data()
    
    // Update local store
    useUserStore.getState().setUser(userId, userData.displayName, userData.color)

    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get current userId and shapes before signing out
    const userId = useUserStore.getState().userId
    const shapes = useShapeStore.getState().shapes
    
    // Clean up before signing out
    if (userId) {
      await Promise.all([
        cleanupUserPresence(userId),        // Remove presence and cursor from RTDB
        unlockUserShapes(userId, shapes),   // Unlock all shapes owned by this user
      ])
    }
    
    // Sign out from Firebase Auth
    await firebaseSignOut(auth)
    
    // Clear local state
    useUserStore.getState().logout()
    
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

/**
 * Initialize auth state listener
 * This should be called once when the app starts
 */
export const initAuthListener = (): (() => void) => {
  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // User is signed in
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          useUserStore.getState().setUser(user.uid, userData.displayName, userData.color)
        } else {
          // Profile doesn't exist, sign out
          useUserStore.getState().setAuthStatus('unauthenticated')
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        useUserStore.getState().setAuthStatus('unauthenticated')
      }
    } else {
      // User is signed out
      useUserStore.getState().logout()
    }
  })

  return unsubscribe
}

