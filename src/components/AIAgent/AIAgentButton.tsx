/**
 * AIAgentButton Component
 * 
 * Toolbar button to toggle the AI agent
 */

import { Sparkles } from 'lucide-react'

interface AIAgentButtonProps {
  isActive: boolean
  onClick: () => void
}

export default function AIAgentButton({ isActive, onClick }: AIAgentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
      title="AI Agent (Cmd/Ctrl+K)"
    >
      <Sparkles className="w-5 h-5" />
    </button>
  )
}

