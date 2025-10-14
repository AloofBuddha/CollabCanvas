/**
 * Firebase Presence & Cursor Sync
 * 
 * Utilities for syncing cursor positions and user presence via Firebase Realtime Database
 */

import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { rtdb } from './firebase'
import { Cursor, RemoteCursor } from '../types'

/**
 * Initialize cursor position sync for current user
 * Returns a function to update cursor position
 */
export function initCursorSync(
  userId: string,
  displayName: string,
  color: string
): (cursor: Cursor) => void {
  const cursorRef = ref(rtdb, `cursors/${userId}`)
  
  // Set up disconnect handler to remove cursor when user leaves
  onDisconnect(cursorRef).remove()

  // Return function to update cursor position
  return (cursor: Cursor) => {
    set(cursorRef, {
      x: cursor.x,
      y: cursor.y,
      name: displayName,
      color: color,
      timestamp: serverTimestamp(),
    })
  }
}

/**
 * Listen to all remote cursors
 * Calls callback with updated remote cursors whenever they change
 */
export function listenToRemoteCursors(
  currentUserId: string,
  callback: (cursors: Record<string, RemoteCursor>) => void
): () => void {
  const cursorsRef = ref(rtdb, 'cursors')
  
  const unsubscribe = onValue(cursorsRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      callback({})
      return
    }

    // Filter out current user and transform data
    const remoteCursors: Record<string, RemoteCursor> = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(data).forEach(([userId, cursorData]: [string, any]) => {
      if (userId !== currentUserId) {
        remoteCursors[userId] = {
          userId,
          x: cursorData.x,
          y: cursorData.y,
          name: cursorData.name,
          color: cursorData.color,
        }
      }
    })

    callback(remoteCursors)
  })

  return unsubscribe
}

/**
 * Initialize user presence
 * Marks user as online and sets up disconnect handler
 * Uses Firebase's recommended presence pattern with .info/connected
 */
export function initUserPresence(
  userId: string,
  displayName: string,
  color: string
): () => void {
  const userStatusRef = ref(rtdb, `presence/${userId}`)
  const connectedRef = ref(rtdb, '.info/connected')
  
  const userData = {
    online: true,
    displayName,
    color,
    lastSeen: serverTimestamp(),
  }

  const offlineData = {
    online: false,
    displayName,
    color,
    lastSeen: serverTimestamp(),
  }

  // Listen to connection state
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      // Not connected to Firebase, do nothing
      return
    }

    // We're connected (or reconnected), set up presence
    // First, set up what happens when we disconnect
    onDisconnect(userStatusRef)
      .set(offlineData)
      .then(() => {
        // Then set ourselves as online
        set(userStatusRef, userData)
      })
  })

  return unsubscribe
}

/**
 * Listen to online users
 * Calls callback with list of online users whenever it changes
 */
export function listenToOnlineUsers(
  callback: (users: Array<{ userId: string; displayName: string; color: string; online: boolean }>) => void
): () => void {
  const presenceRef = ref(rtdb, 'presence')
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      callback([])
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = Object.entries(data).map(([userId, userData]: [string, any]) => ({
      userId,
      displayName: userData.displayName,
      color: userData.color,
      online: userData.online,
    }))

    callback(users)
  })

  return unsubscribe
}

