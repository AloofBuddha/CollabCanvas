import { User } from '../types'
import { getInitials } from '../utils/userUtils'

interface HeaderProps {
  displayName: string
  color: string
  onlineUsers: User[]
  currentUserId: string | null
  onSignOut: () => void
}

const MAX_VISIBLE_USERS = 10

/**
 * Header Component
 * 
 * Top navigation bar with:
 * - App title
 * - Online user avatars (max 10, with overflow indicator)
 * - Current user avatar and name
 * - Sign out button
 */
export default function Header({ 
  displayName, 
  color, 
  onlineUsers, 
  currentUserId, 
  onSignOut 
}: HeaderProps) {
  // Filter out current user (all users in the list are online by definition)
  const remoteUsers = onlineUsers.filter(
    (user) => user.userId !== currentUserId
  )
  
  const visibleUsers = remoteUsers.slice(0, MAX_VISIBLE_USERS)
  const overflowCount = remoteUsers.length - MAX_VISIBLE_USERS

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">CollabCanvas</h1>
      
      <div className="flex items-center gap-4">
        {/* Remote user avatars */}
        {visibleUsers.length > 0 && (
          <div className="flex items-center gap-2">
            {visibleUsers.map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm"
                style={{ backgroundColor: user.color }}
                title={user.displayName}
              >
                {getInitials(user.displayName)}
              </div>
            ))}
            
            {/* Overflow indicator */}
            {overflowCount > 0 && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm bg-gray-600"
                title={`${overflowCount} more user${overflowCount > 1 ? 's' : ''}`}
              >
                +{overflowCount}
              </div>
            )}
          </div>
        )}
        
        {/* Divider if there are remote users */}
        {visibleUsers.length > 0 && (
          <div className="h-8 w-px bg-gray-300" />
        )}
        
        {/* Current user avatar and name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: color }}
            title={displayName}
          >
            {getInitials(displayName)}
          </div>
          <span className="text-gray-800 font-medium">{displayName}</span>
        </div>
        
        {/* Sign out button */}
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

