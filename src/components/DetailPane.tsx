/**
 * DetailPane Component
 * 
 * Figma-style right sidebar for editing shape properties.
 * Shows different controls based on the selected shape type.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Shape, TextShape } from '../types'
import { X } from 'lucide-react'

interface DetailPaneProps {
  shape: Shape
  onClose: () => void
  onUpdateShape: (updates: Partial<Shape>) => void
}

/**
 * Convert any CSS color to hex format for color picker
 * Returns the color as-is if already hex, converts named colors, returns #ffffff for transparent
 */
function colorToHex(color: string): string {
  if (!color) return '#000000'
  if (color === 'transparent') return '#ffffff'
  if (color.startsWith('#')) return color
  
  // Use a canvas to convert named colors to hex
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return color
  ctx.fillStyle = color
  return ctx.fillStyle as string
}

export default function DetailPane({
  shape,
  onClose,
  onUpdateShape,
}: DetailPaneProps) {
  // Local state for all editable fields
  const [localText, setLocalText] = useState(
    shape.type === 'text' ? shape.text : ''
  )
  const [localX, setLocalX] = useState(Math.round(shape.x))
  const [localY, setLocalY] = useState(Math.round(shape.y))
  const [localRotation, setLocalRotation] = useState(Math.round(shape.rotation || 0))
  const [localOpacity, setLocalOpacity] = useState(Math.round((shape.opacity ?? 1.0) * 100)) // Store as 0-100 for UI
  const [localWidth, setLocalWidth] = useState(
    shape.type === 'rectangle' ? Math.round(shape.width) : 0
  )
  const [localHeight, setLocalHeight] = useState(
    shape.type === 'rectangle' ? Math.round(shape.height) : 0
  )
  const [localRadiusX, setLocalRadiusX] = useState(
    shape.type === 'circle' ? Math.round(shape.radiusX) : 0
  )
  const [localRadiusY, setLocalRadiusY] = useState(
    shape.type === 'circle' ? Math.round(shape.radiusY) : 0
  )
  const [localX2, setLocalX2] = useState(
    shape.type === 'line' ? Math.round(shape.x2) : 0
  )
  const [localY2, setLocalY2] = useState(
    shape.type === 'line' ? Math.round(shape.y2) : 0
  )
  const [localStrokeWidth, setLocalStrokeWidth] = useState(
    shape.type === 'line' ? shape.strokeWidth : 2
  )
  const [localFontSize, setLocalFontSize] = useState(
    shape.type === 'text' ? shape.fontSize : 16
  )
  const [localFillColor, setLocalFillColor] = useState(shape.color)
  const [localTextColor, setLocalTextColor] = useState(
    shape.type === 'text' ? shape.textColor : '#000000'
  )
  const [localStroke, setLocalStroke] = useState(
    (shape.type === 'rectangle' || shape.type === 'circle') ? (shape.stroke || 'transparent') : 'transparent'
  )
  const [localBorderWidth, setLocalBorderWidth] = useState(
    (shape.type === 'rectangle' || shape.type === 'circle') ? (shape.strokeWidth || 0) : 0
  )
  
  // Debounce timer refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Update local state when shape changes externally
  useEffect(() => {
    if (shape.type === 'text') {
      setLocalText(shape.text)
      setLocalFontSize(shape.fontSize)
      setLocalTextColor(shape.textColor)
    }
    if (shape.type === 'rectangle') {
      setLocalWidth(Math.round(shape.width))
      setLocalHeight(Math.round(shape.height))
      setLocalStroke(shape.stroke || 'transparent')
      setLocalBorderWidth(shape.strokeWidth || 0)
    }
    if (shape.type === 'circle') {
      setLocalRadiusX(Math.round(shape.radiusX))
      setLocalRadiusY(Math.round(shape.radiusY))
      setLocalStroke(shape.stroke || 'transparent')
      setLocalBorderWidth(shape.strokeWidth || 0)
    }
    if (shape.type === 'line') {
      setLocalX2(Math.round(shape.x2))
      setLocalY2(Math.round(shape.y2))
      setLocalStrokeWidth(shape.strokeWidth)
    }
    setLocalX(Math.round(shape.x))
    setLocalY(Math.round(shape.y))
    setLocalRotation(Math.round(shape.rotation || 0))
    
    // Only update local opacity if no pending debounce (to avoid race conditions)
    if (!debounceTimerRef.current) {
      setLocalOpacity(Math.round((shape.opacity ?? 1.0) * 100))
    }
    setLocalFillColor(shape.color)
  }, [shape, localOpacity])

  // Debounced update function
  const debouncedUpdate = useCallback((updates: Partial<Shape>, delay: number = 500) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null // Clear timer BEFORE update to allow sync
      onUpdateShape(updates)
    }, delay)
  }, [onUpdateShape])

  // Use refs to access latest values in cleanup (avoid triggering cleanup on every change)
  const localStateRef = useRef({ localText, localX, localY, localRotation, localOpacity, localWidth, localHeight, localRadiusX, localRadiusY, localX2, localY2, localStrokeWidth, localFontSize, localFillColor, localTextColor, localStroke, localBorderWidth })
  const shapeRef = useRef(shape)
  const onUpdateShapeRef = useRef(onUpdateShape)
  
  useEffect(() => {
    localStateRef.current = { localText, localX, localY, localRotation, localOpacity, localWidth, localHeight, localRadiusX, localRadiusY, localX2, localY2, localStrokeWidth, localFontSize, localFillColor, localTextColor, localStroke, localBorderWidth }
    shapeRef.current = shape
    onUpdateShapeRef.current = onUpdateShape
  })

  // Flush any pending updates only on true unmount
  useEffect(() => {
    return () => {
      // Flush pending updates immediately on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        // Force immediate update with current local state from ref
        const { localText, localX, localY, localRotation, localOpacity, localWidth, localHeight, localRadiusX, localRadiusY, localX2, localY2, localStrokeWidth, localFontSize, localFillColor, localTextColor, localStroke, localBorderWidth } = localStateRef.current
        const currentShape = shapeRef.current
        const updates: Record<string, unknown> = {}
        if (localX !== Math.round(currentShape.x)) updates.x = localX
        if (localY !== Math.round(currentShape.y)) updates.y = localY
        if (currentShape.type !== 'line' && localRotation !== Math.round(currentShape.rotation || 0)) {
          updates.rotation = localRotation
        }
        if (localOpacity !== Math.round((currentShape.opacity ?? 1.0) * 100)) {
          updates.opacity = localOpacity / 100 // Convert back to 0-1
        }
        
        if (currentShape.type === 'rectangle') {
          if (localWidth !== Math.round(currentShape.width)) updates.width = localWidth
          if (localHeight !== Math.round(currentShape.height)) updates.height = localHeight
          if (localStroke !== (currentShape.stroke || 'transparent')) updates.stroke = localStroke
          if (localBorderWidth !== (currentShape.strokeWidth || 0)) updates.strokeWidth = localBorderWidth
        }
        
        if (currentShape.type === 'circle') {
          if (localRadiusX !== Math.round(currentShape.radiusX)) updates.radiusX = localRadiusX
          if (localRadiusY !== Math.round(currentShape.radiusY)) updates.radiusY = localRadiusY
          if (localStroke !== (currentShape.stroke || 'transparent')) updates.stroke = localStroke
          if (localBorderWidth !== (currentShape.strokeWidth || 0)) updates.strokeWidth = localBorderWidth
        }
        
        if (currentShape.type === 'line') {
          if (localX2 !== Math.round(currentShape.x2)) updates.x2 = localX2
          if (localY2 !== Math.round(currentShape.y2)) updates.y2 = localY2
          if (localStrokeWidth !== currentShape.strokeWidth) updates.strokeWidth = localStrokeWidth
        }
        
        if (currentShape.type === 'text') {
          if (localFontSize !== currentShape.fontSize) updates.fontSize = localFontSize
          if (localText !== currentShape.text) updates.text = localText
          if (localTextColor !== currentShape.textColor) updates.textColor = localTextColor
        }
        
        if (localFillColor !== currentShape.color) updates.color = localFillColor
        
        if (Object.keys(updates).length > 0) {
          onUpdateShapeRef.current(updates)
        }
      }
    }
  }, []) // Empty deps - only run on mount/unmount

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setLocalText(newText)
    // Debounce text updates for performance
    debouncedUpdate({ text: newText } as Partial<TextShape>)
  }

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fontSize = parseInt(e.target.value)
    if (!isNaN(fontSize)) {
      setLocalFontSize(fontSize)
      if (fontSize > 0) {
        debouncedUpdate({ fontSize } as Partial<TextShape>)
      }
    }
  }

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Font family changes are immediate (not rapid)
    onUpdateShape({ fontFamily: e.target.value } as Partial<TextShape>)
  }

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setLocalTextColor(newColor)
    // Debounce color updates for typed values
    debouncedUpdate({ textColor: newColor } as Partial<TextShape>)
  }

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setLocalFillColor(newColor)
    // Debounce color updates for typed values
    debouncedUpdate({ color: newColor })
  }

  const handleAlignChange = (align: 'left' | 'center' | 'right') => {
    onUpdateShape({ align } as Partial<TextShape>)
  }

  const handleVerticalAlignChange = (verticalAlign: 'top' | 'middle' | 'bottom') => {
    onUpdateShape({ verticalAlign } as Partial<TextShape>)
  }

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (axis === 'x') {
        setLocalX(num)
      } else {
        setLocalY(num)
      }
      debouncedUpdate({ [axis]: num })
    }
  }

  const handleRotationChange = (value: string) => {
    const rotation = parseFloat(value)
    if (!isNaN(rotation)) {
      setLocalRotation(rotation)
      debouncedUpdate({ rotation })
    }
  }

  const handleOpacityChange = (value: string) => {
    const opacity = parseFloat(value)
    if (!isNaN(opacity) && opacity >= 0 && opacity <= 100) {
      setLocalOpacity(opacity)
      debouncedUpdate({ opacity: opacity / 100 }) // Convert to 0-1 for storage
    }
  }

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (dimension === 'width') {
        setLocalWidth(num)
      } else {
        setLocalHeight(num)
      }
      if (num > 0) {
        debouncedUpdate({ [dimension]: num })
      }
    }
  }

  const handleRadiusChange = (dimension: 'radiusX' | 'radiusY', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (dimension === 'radiusX') {
        setLocalRadiusX(num)
      } else {
        setLocalRadiusY(num)
      }
      if (num > 0) {
        debouncedUpdate({ [dimension]: num })
      }
    }
  }

  const handleLineEndpointChange = (endpoint: 'x2' | 'y2', value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      if (endpoint === 'x2') {
        setLocalX2(num)
      } else {
        setLocalY2(num)
      }
      debouncedUpdate({ [endpoint]: num })
    }
  }

  const handleStrokeWidthChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num > 0) {
      setLocalStrokeWidth(num)
      debouncedUpdate({ strokeWidth: num })
    }
  }

  const handleStrokeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStroke = e.target.value
    setLocalStroke(newStroke)
    debouncedUpdate({ stroke: newStroke })
  }

  const handleBorderWidthChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setLocalBorderWidth(num)
      debouncedUpdate({ strokeWidth: num })
    }
  }

  const renderTextControls = (textShape: TextShape) => (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <textarea
          value={localText}
          onChange={handleTextChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          placeholder="Enter text..."
        />
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <input
          type="number"
          value={localFontSize}
          onChange={handleFontSizeChange}
          min="8"
          max="200"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Family
        </label>
        <select
          value={textShape.fontFamily}
          onChange={handleFontFamilyChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Impact">Impact</option>
        </select>
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorToHex(localTextColor)}
            onChange={handleTextColorChange}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localTextColor}
            onChange={handleTextColorChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Horizontal Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Horizontal Align
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleAlignChange('left')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              (textShape.align || 'left') === 'left'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Left
          </button>
          <button
            onClick={() => handleAlignChange('center')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              textShape.align === 'center'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Center
          </button>
          <button
            onClick={() => handleAlignChange('right')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              textShape.align === 'right'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Right
          </button>
        </div>
      </div>

      {/* Vertical Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vertical Align
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleVerticalAlignChange('top')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              (textShape.verticalAlign || 'top') === 'top'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => handleVerticalAlignChange('middle')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              textShape.verticalAlign === 'middle'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Middle
          </button>
          <button
            onClick={() => handleVerticalAlignChange('bottom')}
            className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
              textShape.verticalAlign === 'bottom'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Bottom
          </button>
        </div>
      </div>
    </div>
  )

  const renderRectangleControls = () => (
    <div className="space-y-4">
      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            type="number"
            value={localWidth}
            onChange={(e) => handleDimensionChange('width', e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="number"
            value={localHeight}
            onChange={(e) => handleDimensionChange('height', e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorToHex(localStroke)}
            onChange={handleStrokeChange}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localStroke}
            onChange={handleStrokeChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="transparent"
          />
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Width
        </label>
        <input
          type="number"
          value={localBorderWidth}
          onChange={(e) => handleBorderWidthChange(e.target.value)}
          min="0"
          max="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )

  const renderCircleControls = () => (
    <div className="space-y-4">
      {/* Radii */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Radius X
          </label>
          <input
            type="number"
            value={localRadiusX}
            onChange={(e) => handleRadiusChange('radiusX', e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Radius Y
          </label>
          <input
            type="number"
            value={localRadiusY}
            onChange={(e) => handleRadiusChange('radiusY', e.target.value)}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Border Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorToHex(localStroke)}
            onChange={handleStrokeChange}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localStroke}
            onChange={handleStrokeChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="transparent"
          />
        </div>
      </div>

      {/* Border Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Border Width
        </label>
        <input
          type="number"
          value={localBorderWidth}
          onChange={(e) => handleBorderWidthChange(e.target.value)}
          min="0"
          max="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )

  const renderLineControls = () => (
    <div className="space-y-4">
      {/* Endpoint coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X2 (End X)
          </label>
          <input
            type="number"
            value={localX2}
            onChange={(e) => handleLineEndpointChange('x2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y2 (End Y)
          </label>
          <input
            type="number"
            value={localY2}
            onChange={(e) => handleLineEndpointChange('y2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stroke Width
        </label>
        <input
          type="number"
          value={localStrokeWidth}
          onChange={(e) => handleStrokeWidthChange(e.target.value)}
          min="1"
          max="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )

  const renderCommonControls = () => (
    <div className="space-y-4">
      {/* Fill Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fill Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorToHex(localFillColor)}
            onChange={handleFillColorChange}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localFillColor}
            onChange={handleFillColorChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="#D1D5DB"
          />
        </div>
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            X
          </label>
          <input
            type="number"
            value={localX}
            onChange={(e) => handlePositionChange('x', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Y
          </label>
          <input
            type="number"
            value={localY}
            onChange={(e) => handlePositionChange('y', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Rotation - not applicable for lines */}
      {shape.type !== 'line' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rotation (degrees)
          </label>
          <input
            type="number"
            value={localRotation}
            onChange={(e) => handleRotationChange(e.target.value)}
            min="-360"
            max="360"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      {/* Opacity - applicable to all shapes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opacity ({localOpacity}%)
        </label>
        <input
          type="range"
          value={localOpacity}
          onChange={(e) => handleOpacityChange(e.target.value)}
          min="0"
          max="100"
          step="1"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  )

  return (
    <div className="fixed right-0 top-16 mt-[9px] h-[calc(100vh-4rem-9px)] w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-40">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {shape.type} Properties
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Common controls for all shapes */}
        {renderCommonControls()}
        
        {/* Shape-specific controls */}
        {shape.type === 'text' && renderTextControls(shape as TextShape)}
        {shape.type === 'rectangle' && renderRectangleControls()}
        {shape.type === 'circle' && renderCircleControls()}
        {shape.type === 'line' && renderLineControls()}
      </div>
    </div>
  )
}

