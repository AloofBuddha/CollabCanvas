import { useRef } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import { useCanvasPanning } from '../hooks/useCanvasPanning'
import { useShapeCreation } from '../hooks/useShapeCreation'
import { useShapeDragging } from '../hooks/useShapeDragging'
import { useCanvasZoom } from '../hooks/useCanvasZoom'
import { getCursorStyle } from '../utils/canvasUtils'
import {
  HEADER_HEIGHT,
  SHAPE_OPACITY,
  NEW_SHAPE_OPACITY,
  NEW_SHAPE_STROKE_WIDTH,
  NEW_SHAPE_DASH,
} from '../utils/canvasConstants'

type Tool = 'select' | 'rectangle'

interface CanvasProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
}

export default function Canvas({ tool, onToolChange }: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  
  const { shapes, addShape, updateShape } = useShapeStore()
  const { userId, color } = useUserStore()

  // Custom hooks for different canvas behaviors
  const { isPanning, setIsPanning } = useCanvasPanning({ stageRef })
  
  const {
    isDrawing,
    newShape,
    startCreating,
    updateSize,
    finishCreating,
  } = useShapeCreation({
    userId,
    color,
    onShapeCreated: addShape,
    onToolChange,
  })
  
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useShapeDragging({
    isPanning,
    updateShape,
  })
  
  const { handleWheel } = useCanvasZoom()

  // Handle mouse down - start creating rectangle or panning
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const evt = e.evt

    // Middle mouse button (button 1) - start panning
    if (evt.button === 1) {
      setIsPanning(true)
      return
    }

    // Left mouse button with rectangle tool - start creating
    if (tool === 'rectangle' && evt.button === 0) {
      startCreating(e)
    }
  }

  // Handle mouse move - update rectangle size while drawing
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isDrawing) {
      updateSize(e)
    }
  }

  // Handle mouse up - finish creating rectangle or panning
  const handleMouseUp = () => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false)
      return
    }

    // Finish creating rectangle
    if (isDrawing) {
      finishCreating()
    }
  }

  // Handle shape mouse down (for panning)
  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const evt = e.evt
    
    // Middle mouse button - set panning state
    if (evt.button === 1) {
      setIsPanning(true)
    }
  }

  return (
    <div
      className="w-full h-full bg-canvas-bg"
      style={{ cursor: getCursorStyle(isPanning, isDrawing, tool) }}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - HEADER_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        draggable={false}
      >
        <Layer>
          {/* Render all existing shapes */}
          {Object.values(shapes).map((shape) => (
            <Rect
              key={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.color}
              opacity={SHAPE_OPACITY}
              draggable={tool === 'select'}
              onMouseDown={handleShapeMouseDown}
              onDragStart={handleDragStart}
              onDragMove={(e) => handleDragMove(e, shape)}
              onDragEnd={handleDragEnd}
            />
          ))}

          {/* Render shape being created */}
          {newShape && (
            <Rect
              x={newShape.x}
              y={newShape.y}
              width={newShape.width}
              height={newShape.height}
              fill={newShape.color}
              opacity={NEW_SHAPE_OPACITY}
              stroke={color}
              strokeWidth={NEW_SHAPE_STROKE_WIDTH}
              dash={NEW_SHAPE_DASH}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}
