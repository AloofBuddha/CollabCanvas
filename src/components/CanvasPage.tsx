import { signOut } from '../utils/auth'
import useUserStore from '../stores/useUserStore'

/**
 * Canvas Page - Main collaborative canvas view
 * This will be expanded in PR #4 with React Konva
 */
export default function CanvasPage() {
  const { displayName, color } = useUserStore()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="w-screen h-screen bg-canvas-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">CollabCanvas</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ backgroundColor: color }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{displayName}</span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Canvas area - will be implemented in PR #4 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Canvas View
          </h2>
          <p className="text-gray-500">
            React Konva canvas will be implemented in PR #4
          </p>
        </div>
      </div>
    </div>
  )
}

