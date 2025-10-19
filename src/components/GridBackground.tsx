import { Layer, Shape } from 'react-konva'
import Konva from 'konva'
import { useRef, useMemo, useCallback } from 'react'

interface GridBackgroundProps {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

// Buffer multiplier: render this many times the viewport in each direction
const BUFFER_MULTIPLIER = 3

// Only re-render if we've scrolled this far outside the buffer zone (in pixels)
const UPDATE_THRESHOLD = 200

export default function GridBackground({ width, height, scale, offsetX, offsetY }: GridBackgroundProps) {
  // Track the last rendered bounds to avoid unnecessary re-renders
  const lastRenderedBounds = useRef<{
    startX: number
    startY: number
    endX: number
    endY: number
    scale: number
  } | null>(null)
  
  // Base grid size in pixels (at 100% zoom)
  const baseGridSize = 20
  
  // Adjust grid size based on zoom level
  const gridSize = scale < 0.5 ? baseGridSize * 2 : scale < 1 ? baseGridSize : baseGridSize
  
  // Calculate the visible area in world coordinates
  const visibleStartX = -offsetX / scale
  const visibleStartY = -offsetY / scale
  const visibleEndX = visibleStartX + width / scale
  const visibleEndY = visibleStartY + height / scale
  
  // Check if we need to re-render based on scroll position
  const needsUpdate = useMemo(() => {
    const lastBounds = lastRenderedBounds.current
    
    // First render always needs update
    if (!lastBounds) {
      return true
    }
    
    // Always update if scale changed
    if (Math.abs(lastBounds.scale - scale) > 0.01) {
      return true
    }
    
    // Check if visible area is approaching the edge of the rendered buffer
    const thresholdInWorld = UPDATE_THRESHOLD / scale
    
    return (
      visibleStartX < lastBounds.startX + thresholdInWorld ||
      visibleStartY < lastBounds.startY + thresholdInWorld ||
      visibleEndX > lastBounds.endX - thresholdInWorld ||
      visibleEndY > lastBounds.endY - thresholdInWorld
    )
  }, [visibleStartX, visibleStartY, visibleEndX, visibleEndY, scale])
  
  // Calculate expanded bounds with buffer zone (only when needed)
  const renderBounds = useMemo(() => {
    if (!needsUpdate && lastRenderedBounds.current) {
      return lastRenderedBounds.current
    }
    
    // Add buffer zone around visible area
    const bufferWidth = (width / scale) * (BUFFER_MULTIPLIER - 1) / 2
    const bufferHeight = (height / scale) * (BUFFER_MULTIPLIER - 1) / 2
    
    const startX = visibleStartX - bufferWidth
    const startY = visibleStartY - bufferHeight
    const endX = visibleEndX + bufferWidth
    const endY = visibleEndY + bufferHeight
    
    // Round to nearest grid line
    const firstX = Math.floor(startX / gridSize) * gridSize
    const firstY = Math.floor(startY / gridSize) * gridSize
    const lastX = Math.ceil(endX / gridSize) * gridSize
    const lastY = Math.ceil(endY / gridSize) * gridSize
    
    const bounds = {
      startX: firstX,
      startY: firstY,
      endX: lastX,
      endY: lastY,
      scale
    }
    
    // Update the tracked bounds
    lastRenderedBounds.current = bounds
    
    return bounds
  }, [needsUpdate, visibleStartX, visibleStartY, visibleEndX, visibleEndY, width, height, scale, gridSize])
  
  // Memoized scene function for drawing the grid
  const sceneFunc = useCallback((context: Konva.Context) => {
    const { startX, startY, endX, endY } = renderBounds
    
    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      const isMainLine = x % (gridSize * 5) === 0
      
      context.strokeStyle = isMainLine ? '#e0e0e0' : '#f0f0f0'
      context.lineWidth = isMainLine ? 1 / scale : 0.5 / scale
      context.beginPath()
      context.moveTo(x, startY)
      context.lineTo(x, endY)
      context.stroke()
    }
    
    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      const isMainLine = y % (gridSize * 5) === 0
      
      context.strokeStyle = isMainLine ? '#e0e0e0' : '#f0f0f0'
      context.lineWidth = isMainLine ? 1 / scale : 0.5 / scale
      context.beginPath()
      context.moveTo(startX, y)
      context.lineTo(endX, y)
      context.stroke()
    }
  }, [renderBounds, gridSize, scale])
  
  return (
    <Layer listening={false}>
      <Shape
        sceneFunc={sceneFunc}
        listening={false}
      />
    </Layer>
  )
}

