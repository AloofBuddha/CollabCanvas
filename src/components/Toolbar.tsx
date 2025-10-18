import { MousePointer2, Square, Circle, Pen, Type, HelpCircle } from 'lucide-react'
import AIAgentButton from './AIAgent/AIAgentButton'

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text'

interface ToolbarProps {
  selectedTool: Tool
  onSelectTool: (tool: Tool) => void
  isAIAgentOpen: boolean
  onToggleAIAgent: () => void
  onShowKeyboardShortcuts: () => void
}

export default function Toolbar({ selectedTool, onSelectTool, isAIAgentOpen, onToggleAIAgent, onShowKeyboardShortcuts }: ToolbarProps) {
  const tools: { id: Tool; icon: typeof Square; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'line', icon: Pen, label: 'Line' },
    { id: 'text', icon: Type, label: 'Text' },
  ]

  const handleToolSelect = (tool: Tool) => {
    onSelectTool(tool)
    // Remove focus from button after selection to prevent focus ring
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.id

          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md transition-colors
                ${
                  isSelected
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              title={tool.label}
              aria-label={tool.label}
            >
              <Icon size={20} />
            </button>
          )
        })}
        
        {/* Divider */}
        <div className="w-px h-10 bg-gray-200 mx-1" />
        
        {/* AI Agent Button */}
        <AIAgentButton isActive={isAIAgentOpen} onClick={onToggleAIAgent} />
        
        {/* Divider */}
        <div className="w-px h-10 bg-gray-200 mx-1" />
        
        {/* Keyboard Shortcuts Button */}
        <button
          onClick={onShowKeyboardShortcuts}
          className="flex items-center justify-center w-10 h-10 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          title="Keyboard Shortcuts (Press ?)"
          aria-label="Show keyboard shortcuts"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  )
}

