/**
 * UserPresence Component
 * 
 * Displays avatars of online users in the top-right corner
 */

import { User } from '../types'
import { getInitials } from '../utils/userUtils'

interface UserPresenceProps {
  users: User[]
  currentUserId: string | null
}

export default function UserPresence({ users, currentUserId }: UserPresenceProps) {
  // Filter out current user and only show online users
  const onlineUsers = users.filter(
    (user) => user.online && user.userId !== currentUserId
  )

  if (onlineUsers.length === 0) {
    return null
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
      {onlineUsers.map((user) => (
        <div
          key={user.userId}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg"
          style={{ backgroundColor: user.color }}
          title={user.displayName}
        >
          {getInitials(user.displayName)}
        </div>
      ))}
    </div>
  )
}

