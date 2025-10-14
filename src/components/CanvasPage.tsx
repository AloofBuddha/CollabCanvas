import { useState, useEffect, useCallback, useRef } from 'react'
import { signOut } from '../utils/auth'
import { getInitials } from '../utils/userUtils'
import {
  initCursorSync,
  listenToRemoteCursors,
  initUserPresence,
  listenToOnlineUsers,
} from '../utils/firebasePresence'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import UserPresence from './UserPresence'
import { Cursor, User } from '../types'

type Tool = 'select' | 'rectangle'

/**
 * Canvas Page - Main collaborative canvas view
 */
export default function CanvasPage() {
  const { userId, displayName, color } = useUserStore()
  const { setRemoteCursor, removeRemoteCursor, clearRemoteCursors } = useCursorStore()
  const [selectedTool, setSelectedTool] = useState<Tool>('select')
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const updateCursorRef = useRef<((cursor: Cursor) => void) | null>(null)

  // Initialize cursor sync and presence
  useEffect(() => {
    if (!userId) return

    // Initialize presence (returns unsubscribe function)
    const unsubscribePresence = initUserPresence(userId, displayName, color)

    // Initialize cursor sync
    const updateCursor = initCursorSync(userId, displayName, color)
    updateCursorRef.current = updateCursor

    // Listen to remote cursors
    const unsubscribeCursors = listenToRemoteCursors(userId, (cursors) => {
      // Clear all first
      clearRemoteCursors()
      // Then set all remote cursors
      Object.entries(cursors).forEach(([cursorUserId, cursor]) => {
        setRemoteCursor(cursorUserId, cursor)
      })
    })

    // Listen to online users
    const unsubscribeUsers = listenToOnlineUsers((users) => {
      setOnlineUsers(users)
    })

    return () => {
      unsubscribePresence()
      unsubscribeCursors()
      unsubscribeUsers()
      clearRemoteCursors()
    }
  }, [userId, displayName, color, setRemoteCursor, removeRemoteCursor, clearRemoteCursors])

  const handleCursorMove = useCallback((cursor: Cursor) => {
    if (updateCursorRef.current) {
      updateCursorRef.current(cursor)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="w-screen h-screen bg-canvas-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">CollabCanvas</h1>
        
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: color }}
            title={displayName}
          >
            {getInitials(displayName)}
          </div>
          {displayName}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas
          tool={selectedTool}
          onToolChange={setSelectedTool}
          onCursorMove={handleCursorMove}
        />
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
        <UserPresence users={onlineUsers} currentUserId={userId} />
      </div>
    </div>
  )
}

