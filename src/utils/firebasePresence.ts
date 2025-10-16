/**
 * Firebase Presence & Cursor Sync
 * 
 * Utilities for syncing cursor positions and user presence via Firebase Realtime Database
 */

import { ref, onValue, set, onDisconnect, serverTimestamp, remove } from 'firebase/database'
import { rtdb } from './firebase'
import { Cursor, RemoteCursor } from '../types'
import { getUserColorFromId } from './userColors'

/**
 * Get the deterministic color for a user based on their user ID.
 * This ensures all clients see the same color for the same user.
 * 
 * @param userId - The unique user identifier
 * @returns A hex color string from the curated palette
 */
function getUserColor(userId: string): string {
  return getUserColorFromId(userId)
}

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
 * Adds user to presence with an available color and sets up disconnect handler to remove them
 * Uses Firebase's recommended presence pattern with .info/connected
 * Returns unsubscribe function and the assigned color
 */
export async function initUserPresence(
  userId: string,
  displayName: string
): Promise<{ unsubscribe: () => void; color: string }> {
  const userStatusRef = ref(rtdb, `presence/${userId}`)
  const connectedRef = ref(rtdb, '.info/connected')
  
  // Get deterministic color based on user ID (same for all clients)
  const color = getUserColor(userId)
  
  const userData = {
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
    // First, set up what happens when we disconnect - REMOVE the user entirely
    onDisconnect(userStatusRef)
      .remove()
      .then(() => {
        // Then add ourselves to presence
        set(userStatusRef, userData)
      })
  })

  return { unsubscribe, color }
}

/**
 * Listen to online users
 * Calls callback with list of currently online users
 * Only users currently in the presence list are returned (all are online by definition)
 */
export function listenToOnlineUsers(
  callback: (users: Array<{ userId: string; displayName: string; color: string }>) => void
): () => void {
  const presenceRef = ref(rtdb, 'presence')
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const data = snapshot.val()
    if (!data) {
      callback([])
      return
    }

    // All users in presence are online (we remove them on disconnect)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users = Object.entries(data).map(([userId, userData]: [string, any]) => ({
      userId,
      displayName: userData.displayName,
      color: userData.color,
    }))

    callback(users)
  })

  return unsubscribe
}

/**
 * Clean up user presence and cursor data on explicit logout
 * This ensures immediate cleanup when user signs out (not just on disconnect)
 */
export async function cleanupUserPresence(userId: string): Promise<void> {
  const cursorRef = ref(rtdb, `cursors/${userId}`)
  const presenceRef = ref(rtdb, `presence/${userId}`)
  
  // Remove both cursor and presence data
  await Promise.all([
    remove(cursorRef),
    remove(presenceRef),
  ])
}

