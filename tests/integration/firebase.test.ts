import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { initializeApp, getApps, deleteApp, FirebaseApp } from 'firebase/app'
import { getAuth, signInAnonymously, signOut, Auth } from 'firebase/auth'
import { getFirestore, collection, getDocs, Firestore } from 'firebase/firestore'
import { getDatabase, ref, get, Database } from 'firebase/database'

/**
 * Firebase Integration Tests
 * 
 * These tests verify that Firebase is configured correctly and all services are accessible.
 * Run with: npm test -- tests/integration/firebase.test.ts
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

describe('Firebase Configuration', () => {
  it('should have all required environment variables', () => {
    expect(firebaseConfig.apiKey).toBeDefined()
    expect(firebaseConfig.authDomain).toBeDefined()
    expect(firebaseConfig.projectId).toBeDefined()
    expect(firebaseConfig.storageBucket).toBeDefined()
    expect(firebaseConfig.messagingSenderId).toBeDefined()
    expect(firebaseConfig.appId).toBeDefined()
    expect(firebaseConfig.databaseURL).toBeDefined()
    
    // Make sure they're not placeholder values
    expect(firebaseConfig.apiKey).not.toBe('your-api-key')
    expect(firebaseConfig.projectId).not.toBe('your-project-id')
  })

  it('should initialize Firebase app successfully', () => {
    const app = initializeApp(firebaseConfig, 'test-app-init')
    
    expect(app).toBeDefined()
    expect(app.name).toBe('test-app-init')
    expect(app.options.projectId).toBe(firebaseConfig.projectId)
    
    // Cleanup
    deleteApp(app)
  })
})

describe('Firebase Authentication', () => {
  let app: FirebaseApp
  let auth: Auth

  beforeAll(() => {
    // Check if app already exists to avoid re-initialization
    const existingApps = getApps()
    if (existingApps.length === 0) {
      app = initializeApp(firebaseConfig, 'test-app-auth')
    } else {
      app = existingApps[0]
    }
    auth = getAuth(app)
  })

  afterAll(async () => {
    if (auth.currentUser) {
      await signOut(auth)
    }
  })

  it('should initialize auth service', () => {
    expect(auth).toBeDefined()
    expect(auth.app.options.projectId).toBe(firebaseConfig.projectId)
  })

  it('should support anonymous sign-in', async () => {
    // This test will fail if Anonymous auth is not enabled in Firebase Console
    // Enable it at: Firebase Console > Authentication > Sign-in method > Anonymous
    
    try {
      const userCredential = await signInAnonymously(auth)
      
      expect(userCredential).toBeDefined()
      expect(userCredential.user).toBeDefined()
      expect(userCredential.user.isAnonymous).toBe(true)
      
      // Cleanup
      await signOut(auth)
    } catch (error) {
      // If anonymous auth isn't enabled, provide helpful message
      if (error instanceof Error && 'code' in error && error.code === 'auth/admin-restricted-operation') {
        console.warn('\n⚠️  Anonymous authentication is not enabled.')
        console.warn('   Enable it at: Firebase Console > Authentication > Sign-in method > Anonymous\n')
      }
      throw error
    }
  }, 10000) // 10 second timeout for network operations
})

describe('Firestore Database', () => {
  let app: FirebaseApp
  let db: Firestore

  beforeAll(() => {
    const existingApps = getApps()
    if (existingApps.length === 0) {
      app = initializeApp(firebaseConfig, 'test-app-firestore')
    } else {
      app = existingApps[0]
    }
    db = getFirestore(app)
  })

  it('should initialize Firestore service', () => {
    expect(db).toBeDefined()
    expect(db.app.options.projectId).toBe(firebaseConfig.projectId)
  })

  it('should connect to Firestore successfully', async () => {
    // Attempt to read from a test collection (doesn't need to exist)
    const testRef = collection(db, 'test-connection')
    
    try {
      const snapshot = await getDocs(testRef)
      expect(snapshot).toBeDefined()
      // Collection might be empty, but we should get a valid snapshot
      expect(Array.isArray(snapshot.docs)).toBe(true)
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'permission-denied') {
        console.warn('\n⚠️  Firestore permissions are too restrictive.')
        console.warn('   For testing, use test mode rules in Firebase Console.\n')
      }
      throw error
    }
  }, 10000)
})

describe('Realtime Database', () => {
  let app: FirebaseApp
  let rtdb: Database

  beforeAll(() => {
    const existingApps = getApps()
    if (existingApps.length === 0) {
      app = initializeApp(firebaseConfig, 'test-app-rtdb')
    } else {
      app = existingApps[0]
    }
    rtdb = getDatabase(app)
  })

  it('should initialize Realtime Database service', () => {
    expect(rtdb).toBeDefined()
    expect(rtdb.app.options.projectId).toBe(firebaseConfig.projectId)
  })

  it('should connect to Realtime Database successfully', async () => {
    const testRef = ref(rtdb, '/')
    
    try {
      const snapshot = await get(testRef)
      expect(snapshot).toBeDefined()
      // Database might be empty, but we should get a valid snapshot
      expect(snapshot.exists).toBeDefined()
    } catch (error) {
      if (error instanceof Error && (error.message.includes('404') || error.message.includes('not found'))) {
        console.error('\n❌ Realtime Database URL might be incorrect.')
        console.error(`   Current URL: ${firebaseConfig.databaseURL}`)
        console.error('   Check: Firebase Console > Realtime Database for correct URL\n')
      }
      throw error
    }
  }, 10000)

  it('should have correct database URL format', () => {
    expect(firebaseConfig.databaseURL).toBeTruthy()
    expect(
      firebaseConfig.databaseURL.startsWith('https://') &&
      (firebaseConfig.databaseURL.includes('firebaseio.com') ||
       firebaseConfig.databaseURL.includes('firebasedatabase.app'))
    ).toBe(true)
  })
})

