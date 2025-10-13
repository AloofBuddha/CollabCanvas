import { useState } from 'react'
import { signOut } from '../utils/auth'
import useUserStore from '../stores/useUserStore'
import Canvas from './Canvas'
import Toolbar from './Toolbar'

type Tool = 'select' | 'rectangle'

/**
 * Canvas Page - Main collaborative canvas view
 */
export default function CanvasPage() {
  const { displayName, color } = useUserStore()
  const [selectedTool, setSelectedTool] = useState<Tool>('select')

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

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <Canvas tool={selectedTool} onToolChange={setSelectedTool} />
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
      </div>
    </div>
  )
}

