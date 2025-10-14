/**
 * Firebase Presence & Cursor Sync
 * 
 * Utilities for syncing cursor positions and user presence via Firebase Realtime Database
 */

import { ref, onValue, set, onDisconnect, serverTimestamp, remove, get } from 'firebase/database'
import { rtdb } from './firebase'
import { Cursor, RemoteCursor } from '../types'

// Available colors for online users (10 unique colors)
const AVAILABLE_COLORS = [
  '#FF5733', // Red-Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#F033FF', // Magenta
  '#FF33F0', // Pink
  '#33FFF0', // Cyan
  '#F0FF33', // Yellow
  '#FF8C33', // Orange
  '#8C33FF', // Purple
  '#33FF8C', // Mint
]

/**
 * Select an available color for a new user
 * Picks the first color not currently in use by online users
 * If all colors are taken, picks a random one (for 11+ concurrent users)
 */
async function selectAvailableColor(): Promise<string> {
  const presenceRef = ref(rtdb, 'presence')
  const snapshot = await get(presenceRef)
  
  if (!snapshot.exists()) {
    // No one online, return first color
    return AVAILABLE_COLORS[0]
  }
  
  // Get all colors currently in use
  const data = snapshot.val()
  const usedColors = new Set<string>()
  Object.values(data).forEach((userData) => {
    if (userData && typeof userData === 'object' && 'color' in userData) {
      usedColors.add(userData.color as string)
    }
  })
  
  // Find first available color
  const availableColor = AVAILABLE_COLORS.find(color => !usedColors.has(color))
  
  // If all colors taken (11+ users), pick a random one
  return availableColor || AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)]
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
  
  // Select an available color based on current online users
  const color = await selectAvailableColor()
  
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

