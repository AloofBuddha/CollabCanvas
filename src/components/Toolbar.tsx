import { MousePointer2, Square } from 'lucide-react'

type Tool = 'select' | 'rectangle'

interface ToolbarProps {
  selectedTool: Tool
  onSelectTool: (tool: Tool) => void
}

export default function Toolbar({ selectedTool, onSelectTool }: ToolbarProps) {
  const tools: { id: Tool; icon: typeof Square; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
  ]

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isSelected = selectedTool === tool.id

          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
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
      </div>
    </div>
  )
}

