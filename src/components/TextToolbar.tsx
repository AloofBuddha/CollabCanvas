/**
 * TextToolbar Component
 * 
 * Floating toolbar that appears above selected text shapes.
 * Provides controls for font size and font family.
 */

import { TextShape } from '../types'

interface TextToolbarProps {
  shape: TextShape
  stageScale: number
  stageX: number
  stageY: number
  onFontSizeChange: (fontSize: number) => void
  onFontFamilyChange: (fontFamily: string) => void
}

const FONT_SIZES = [12, 14, 16, 18, 24, 32, 48, 64]
const FONT_FAMILIES = ['Arial', 'Inter', 'Times New Roman', 'Courier New', 'Georgia']

export default function TextToolbar({
  shape,
  stageScale,
  stageX,
  stageY,
  onFontSizeChange,
  onFontFamilyChange,
}: TextToolbarProps) {
  // Calculate screen position above the text shape
  const screenX = shape.x * stageScale + stageX
  const screenY = shape.y * stageScale + stageY - 60 // Position 60px above text

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      {/* Font Size Dropdown */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500">Size:</label>
        <select
          value={shape.fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:border-blue-400 focus:border-blue-500 focus:outline-none"
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Font Family Dropdown */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500">Font:</label>
        <select
          value={shape.fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded hover:border-blue-400 focus:border-blue-500 focus:outline-none"
          style={{ fontFamily: shape.fontFamily }}
        >
          {FONT_FAMILIES.map((family) => (
            <option key={family} value={family} style={{ fontFamily: family }}>
              {family}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

