/**
 * ShapeDimensionLabel Component
 * 
 * Displays the dimensions (width × height) below a selected shape.
 * The text remains horizontal and is positioned below the rotated bounding box.
 */

import { Text } from 'react-konva'
import { Shape } from '../types'
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
  const { x, y, rotation = 0 } = shape
  
  // Get shape dimensions polymorphically
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
  const labelX = centerX
  const labelY = maxY
  
  // Format dimensions using shape factory
  const text = formatShapeDimensions(shape)
  
  // Scale font size inversely with zoom (constant size in screen space)
  const fontSize = LABEL_FONT_SIZE / stageScale
  const padding = LABEL_PADDING / stageScale
  
  return (
    <Text
      x={labelX}
      y={labelY + padding}
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

