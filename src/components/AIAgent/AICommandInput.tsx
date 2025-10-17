/**
 * AICommandInput Component
 * 
 * Text area and execute button for AI commands
 */

import { KeyboardEvent, useEffect, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'

interface AICommandInputProps {
  isExecuting: boolean
  currentCommand: string
  onCommandChange: (command: string) => void
  onExecute: () => void
  isDetailPaneOpen?: boolean
}

export default function AICommandInput({
  isExecuting,
  currentCommand,
  onCommandChange,
  onExecute,
  isDetailPaneOpen = false,
}: AICommandInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus()
  }, [isExecuting])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Execute on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isExecuting && currentCommand.trim()) {
        onExecute()
      }
    }
  }

  return (
    <div 
      className={`absolute bottom-24 left-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-200 ${
        isDetailPaneOpen ? 'right-80' : 'right-0'
      }`}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={currentCommand}
          onChange={(e) => onCommandChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to create... (e.g., 'create a red circle at position 100, 200')"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          disabled={isExecuting}
        />

        {/* Execute Button */}
        <button
          onClick={onExecute}
          disabled={isExecuting || !currentCommand.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 h-[68px]"
          title="Execute command (or press Enter)"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Executing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Execute</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

