import { Group, Rect } from 'react-konva'
import { Shape } from '../types'

interface MultiSelectBoxProps {
  shapes: Shape[]
  stageScale: number
  userId: string | null
  onDragStart: () => void
  onDragMove: (deltaX: number, deltaY: number) => void
  onDragEnd: () => void
}

export default function MultiSelectBox({
  shapes,
  stageScale,
  onDragStart,
  onDragMove,
  onDragEnd,
}: MultiSelectBoxProps) {
  if (shapes.length === 0) return null

  // Calculate bounding box for all selected shapes
  const bounds = calculateBounds(shapes)
  
  // Add more padding around the bounding box for better clearance
  const padding = 15 / stageScale
  const boxX = bounds.minX - padding
  const boxY = bounds.minY - padding
  const boxWidth = bounds.maxX - bounds.minX + padding * 2
  const boxHeight = bounds.maxY - bounds.minY + padding * 2

  return (
    <Group
      x={boxX}
      y={boxY}
      draggable={true}
      onDragStart={(e) => {
        e.cancelBubble = true
        onDragStart()
      }}
      onDragMove={(e) => {
        const deltaX = e.target.x() - boxX
        const deltaY = e.target.y() - boxY
        onDragMove(deltaX, deltaY)
      }}
      onDragEnd={(e) => {
        e.cancelBubble = true
        onDragEnd()
      }}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container()
        if (container) {
          container.style.cursor = 'move'
        }
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container()
        if (container) {
          container.style.cursor = 'default'
        }
      }}
    >
      {/* Invisible hitbox for dragging */}
      <Rect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        fill="transparent"
        listening={true}
      />
      
      {/* Visual border */}
      <Rect
        x={0}
        y={0}
        width={boxWidth}
        height={boxHeight}
        stroke="#007AFF"
        strokeWidth={2 / stageScale}
        dash={[6 / stageScale, 4 / stageScale]}
        listening={false}
      />
    </Group>
  )
}

// Helper function to calculate bounding box for multiple shapes
// Accounts for rotation by calculating rotated corner positions
function calculateBounds(shapes: Shape[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  shapes.forEach(shape => {
    const rotation = shape.rotation || 0
    
    if (shape.type === 'line') {
      // Lines: just use both endpoints
      minX = Math.min(minX, shape.x, shape.x2)
      minY = Math.min(minY, shape.y, shape.y2)
      maxX = Math.max(maxX, shape.x, shape.x2)
      maxY = Math.max(maxY, shape.y, shape.y2)
    } else if (rotation !== 0) {
      // For rotated shapes, calculate all corner positions
      const corners = getRotatedCorners(shape)
      corners.forEach(corner => {
        minX = Math.min(minX, corner.x)
        minY = Math.min(minY, corner.y)
        maxX = Math.max(maxX, corner.x)
        maxY = Math.max(maxY, corner.y)
      })
    } else {
      // Non-rotated shapes: simple bounds
      const shapeMinX = shape.x
      const shapeMinY = shape.y
      let shapeMaxX = shape.x
      let shapeMaxY = shape.y

      switch (shape.type) {
        case 'rectangle':
          shapeMaxX = shape.x + shape.width
          shapeMaxY = shape.y + shape.height
          break
        case 'circle':
          shapeMaxX = shape.x + shape.radiusX * 2
          shapeMaxY = shape.y + shape.radiusY * 2
          break
        case 'text':
          shapeMaxX = shape.x + (shape.width || 200)
          shapeMaxY = shape.y + 50
          break
      }

      minX = Math.min(minX, shapeMinX)
      minY = Math.min(minY, shapeMinY)
      maxX = Math.max(maxX, shapeMaxX)
      maxY = Math.max(maxY, shapeMaxY)
    }
  })

  return { minX, minY, maxX, maxY }
}

// Get the corners of a rotated shape
function getRotatedCorners(shape: Shape): Array<{ x: number; y: number }> {
  let width = 0
  let height = 0
  let centerX = shape.x
  let centerY = shape.y

  switch (shape.type) {
    case 'rectangle':
      width = shape.width
      height = shape.height
      centerX = shape.x + width / 2
      centerY = shape.y + height / 2
      break
    case 'circle':
      width = shape.radiusX * 2
      height = shape.radiusY * 2
      centerX = shape.x + shape.radiusX
      centerY = shape.y + shape.radiusY
      break
    case 'text':
      width = shape.width || 200
      height = 50
      centerX = shape.x + width / 2
      centerY = shape.y + height / 2
      break
    default:
      return [{ x: shape.x, y: shape.y }]
  }

  const rotation = (shape.rotation || 0) * Math.PI / 180
  const halfWidth = width / 2
  const halfHeight = height / 2

  // Calculate the four corners relative to center, then rotate
  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ]

  return corners.map(corner => ({
    x: centerX + corner.x * Math.cos(rotation) - corner.y * Math.sin(rotation),
    y: centerY + corner.x * Math.sin(rotation) + corner.y * Math.cos(rotation),
  }))
}

