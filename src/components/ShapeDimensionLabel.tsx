/**
 * ShapeDimensionLabel Component
 * 
 * Displays the dimensions (width × height) below a selected shape.
 * The text remains horizontal and is positioned below the rotated bounding box.
 */

import { Text } from 'react-konva'
import { Shape, LineShape, RectangleShape, CircleShape } from '../types'
import { getShapeDimensions, formatShapeDimensions } from '../utils/shapeFactory'

// Display constants
const LABEL_FONT_SIZE = 14
const LABEL_PADDING = 8
const LABEL_CENTER_OFFSET_MULTIPLIER = 0.3

interface ShapeDimensionLabelProps {
  shape: Shape
  stageScale: number
}

export default function ShapeDimensionLabel({ shape, stageScale }: ShapeDimensionLabelProps) {
  // Calculate inverse border width (same logic as ShapeRenderer)
  const inverseBorderWidth = Math.max(2, 4 * Math.pow(stageScale, -0.6))
  
  // Get shape's stroke width
  const shapeStrokeWidth = (shape.type === 'rectangle' || shape.type === 'circle') 
    ? ((shape as RectangleShape | CircleShape).strokeWidth || 0) 
    : 0
  const { x, y, rotation = 0 } = shape
  
  let labelX: number
  let labelY: number
  
  // Handle line shapes differently - position label below the lower endpoint
  if (shape.type === 'line') {
    const line = shape as LineShape
    const centerX = (line.x + line.x2) / 2
    
    // Find the lower of the two endpoints (higher Y value)
    const lowerY = Math.max(line.y, line.y2)
    
    labelX = centerX
    labelY = lowerY
  } else {
    // Get shape dimensions polymorphically for rectangles/circles
    const { width, height } = getShapeDimensions(shape)
    
    // Calculate the center of the shape
    const centerX = x + width / 2
    const centerY = y + height / 2
    
    // Calculate all four corners of the shape before rotation
    const corners = [
      { x: x, y: y },                    // top-left
      { x: x + width, y: y },            // top-right
      { x: x, y: y + height },           // bottom-left
      { x: x + width, y: y + height },   // bottom-right
    ]
    
    // Rotate all corners around the center
    const radians = rotation * Math.PI / 180
    const rotatedCorners = corners.map(corner => {
      const dx = corner.x - centerX
      const dy = corner.y - centerY
      return {
        x: centerX + (dx * Math.cos(radians) - dy * Math.sin(radians)),
        y: centerY + (dx * Math.sin(radians) + dy * Math.cos(radians))
      }
    })
    
    // Find the bottom-most point of the rotated bounding box
    const maxY = Math.max(...rotatedCorners.map(c => c.y))
    
    // Position label at horizontal center, below the bounding box
    labelX = centerX
    labelY = maxY
  }
  
  // Format dimensions using shape factory
  const text = formatShapeDimensions(shape)
  
  // Scale font size inversely with zoom (constant size in screen space)
  const fontSize = LABEL_FONT_SIZE / stageScale
  const padding = LABEL_PADDING / stageScale
  
  // Calculate additional offset to clear both borders
  // Shape border extends shapeStrokeWidth/2 outward
  // Selection border extends inverseBorderWidth/2 outward from its path
  const borderClearance = shapeStrokeWidth / 2 + inverseBorderWidth / 2 + inverseBorderWidth / 2
  
  return (
    <Text
      x={labelX}
      y={labelY + borderClearance + padding}
      text={text}
      fontSize={fontSize}
      fontFamily="Inter, system-ui, sans-serif"
      fill="#333333"
      align="center"
      offsetX={text.length * fontSize * LABEL_CENTER_OFFSET_MULTIPLIER} // Approximate center offset
      listening={false} // Don't intercept mouse events
    />
  )
}

