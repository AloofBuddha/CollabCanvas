import { X } from 'lucide-react'

interface KeyboardShortcutsGuideProps {
  onClose: () => void
}

interface ShortcutGroup {
  title: string
  shortcuts: { keys: string[]; description: string }[]
}

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: [isMac ? '⌘' : 'Ctrl', 'Z'], description: 'Undo' },
      { keys: [isMac ? '⌘' : 'Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: [isMac ? '⌘' : 'Ctrl', 'Y'], description: 'Redo (alternative)' },
      { keys: ['Esc'], description: 'Deselect all shapes' },
    ],
  },
  {
    title: 'Shape Selection',
    shortcuts: [
      { keys: [isMac ? '⌘' : 'Ctrl', 'A'], description: 'Select all shapes' },
      { keys: ['Click'], description: 'Select shape' },
      { keys: ['Shift', 'Click'], description: 'Add to selection' },
    ],
  },
  {
    title: 'Shape Manipulation',
    shortcuts: [
      { keys: [isMac ? '⌘' : 'Ctrl', 'D'], description: 'Duplicate selected shapes' },
      { keys: ['Alt', 'Drag'], description: 'Duplicate while dragging' },
      { keys: ['↑', '↓', '←', '→'], description: 'Nudge selected shapes (1px)' },
      { keys: ['Shift', '↑↓←→'], description: 'Nudge selected shapes (10px)' },
      { keys: ['Delete'], description: 'Delete selected shapes' },
    ],
  },
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Middle Mouse', 'Drag'], description: 'Pan canvas' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Ctrl', 'Scroll'], description: 'Zoom in/out (alternative)' },
    ],
  },
  {
    title: 'Tools',
    shortcuts: [
      { keys: ['V'], description: 'Select tool' },
      { keys: ['R'], description: 'Rectangle tool' },
      { keys: ['C'], description: 'Circle tool' },
      { keys: ['L'], description: 'Line tool' },
      { keys: ['T'], description: 'Text tool' },
    ],
  },
]

export default function KeyboardShortcutsGuide({ onClose }: KeyboardShortcutsGuideProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 pointer-events-auto max-h-[80vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4 space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded">?</kbd> to toggle this guide
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

