/**
 * AICommandHelp Component
 * 
 * Modal showing examples of AI commands users can give
 */

import { X } from 'lucide-react'
import React from 'react'

interface AICommandHelpProps {
  onClose: () => void
}

const AICommandHelp: React.FC<AICommandHelpProps> = ({ onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close if clicking the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const examples = [
    {
      category: 'Creating Shapes',
      items: [
        { command: 'create a red circle at 100, 200', description: 'Basic shape creation with position and color' },
        { command: 'add a blue rectangle at 300, 400 rotated 45 degrees', description: 'Rectangle with rotation' },
        { command: 'create a green line from 500, 600 to 700, 800', description: 'Line with start and end points' },
        { command: 'add text "Hello World" at 500, 600', description: 'Simple text' },
        { command: 'create centered text "Title" at 400, 100 with font size 32', description: 'Styled, aligned text' },
      ],
    },
    {
      category: 'Styling & Colors',
      items: [
        { command: 'make circle-1 red', description: 'Change shape color' },
        { command: 'add a red border to rectangle-1', description: 'Add stroke/border' },
        { command: 'make circle-3 semi-transparent', description: 'Adjust opacity' },
        { command: 'make text-2 bigger with blue text', description: 'Update text size and color' },
        { command: 'add a white background to text-2', description: 'Add text background' },
      ],
    },
    {
      category: 'Positioning & Size',
      items: [
        { command: 'move rectangle-2 to 500, 600', description: 'Move to absolute position' },
        { command: 'move my-circle 50 pixels to the right', description: 'Relative movement' },
        { command: 'change the size of my-box to 200x300', description: 'Resize shape' },
        { command: 'resize circle-2 to radius 100', description: 'Change circle size' },
        { command: 'rotate title-text 45 degrees', description: 'Rotate shape' },
      ],
    },
    {
      category: 'Layout & Alignment',
      items: [
        { command: 'align selected shapes horizontally', description: 'Align to same horizontal line' },
        { command: 'align selected shapes vertically', description: 'Align to same vertical line' },
        { command: 'distribute selected shapes horizontally', description: 'Evenly space shapes horizontally' },
        { command: 'distribute selected shapes vertically by 40px', description: 'Distribute with custom spacing' },
        { command: 'center selected shapes horizontally', description: 'Center on canvas' },
      ],
    },
    {
      category: 'Working with Selected Shapes',
      items: [
        { command: 'change selected shapes to blue', description: 'Update all selected' },
        { command: 'make selected shapes transparent', description: 'Adjust opacity of selection' },
        { command: 'rotate selected shapes 90 degrees', description: 'Rotate all selected' },
        { command: 'delete selected shapes', description: 'Remove selected shapes' },
        { command: 'bring circle-1 to front', description: 'Change layering order' },
      ],
    },
    {
      category: 'Complex Compositions',
      items: [
        { command: 'make a smiley face emoji', description: 'Multiple shapes working together' },
        { command: 'create a house', description: 'Complex shape composition' },
        { command: 'build me a login component', description: 'Functional UI component' },
        { command: 'make a button that says "Click Me"', description: 'Interactive element' },
      ],
    },
    {
      category: 'Deleting',
      items: [
        { command: 'delete circle-1', description: 'Delete by name' },
        { command: 'remove my-line', description: 'Alternative delete syntax' },
        { command: 'delete all rectangles', description: 'Delete by type' },
        { command: 'delete selected shapes', description: 'Delete current selection' },
      ],
    },
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 z-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Command Examples</h2>
          <p className="text-gray-600 mb-6">
            Tell the AI what you want to create or modify in natural language. Here are some examples:
          </p>
          <div className="space-y-6">
            {examples.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-1">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex flex-col text-gray-600">
                      <div className="flex items-start gap-3">
                        <span className="font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm flex-1 border border-blue-200">
                          {item.command}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 ml-1 mt-1">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Shape names:</strong> Every shape has a name (e.g., "circle-1", "my-box") shown when you select it</li>
              <li>• <strong>Positions:</strong> Canvas coordinates where (0,0) is top-left</li>
              <li>• <strong>Colors:</strong> Use color names (red, blue) or hex codes (#FF0000)</li>
              <li>• <strong>Selection:</strong> Select shapes first, then use "selected shapes" in your command</li>
              <li>• <strong>Be specific:</strong> More details = better results (e.g., "create a large red circle at 200, 300 with 50% opacity")</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AICommandHelp

