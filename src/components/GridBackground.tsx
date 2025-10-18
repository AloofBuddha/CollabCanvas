import { Layer, Line } from 'react-konva'

interface GridBackgroundProps {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

export default function GridBackground({ width, height, scale, offsetX, offsetY }: GridBackgroundProps) {
  // Base grid size in pixels (at 100% zoom)
  const baseGridSize = 20
  
  // Adjust grid size based on zoom level
  // When zoomed out (scale < 1), make grid larger
  // When zoomed in (scale > 1), keep grid size consistent or smaller
  const gridSize = scale < 0.5 ? baseGridSize * 2 : scale < 1 ? baseGridSize : baseGridSize
  
  // Calculate the visible area in world coordinates
  const startX = -offsetX / scale
  const startY = -offsetY / scale
  const endX = startX + width / scale
  const endY = startY + height / scale
  
  // Round to nearest grid line
  const firstX = Math.floor(startX / gridSize) * gridSize
  const firstY = Math.floor(startY / gridSize) * gridSize
  
  const lines: JSX.Element[] = []
  
  // Vertical lines
  for (let x = firstX; x <= endX; x += gridSize) {
    const isMainLine = x % (gridSize * 5) === 0
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={isMainLine ? '#e0e0e0' : '#f0f0f0'}
        strokeWidth={isMainLine ? 1 / scale : 0.5 / scale}
        listening={false}
      />
    )
  }
  
  // Horizontal lines
  for (let y = firstY; y <= endY; y += gridSize) {
    const isMainLine = y % (gridSize * 5) === 0
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={isMainLine ? '#e0e0e0' : '#f0f0f0'}
        strokeWidth={isMainLine ? 1 / scale : 0.5 / scale}
        listening={false}
      />
    )
  }
  
  return (
    <Layer listening={false}>
      {lines}
    </Layer>
  )
}

