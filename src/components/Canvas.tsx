import { useRef } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import { useCanvasPanning } from '../hooks/useCanvasPanning'
import { useShapeCreation } from '../hooks/useShapeCreation'
import { useShapeDragging } from '../hooks/useShapeDragging'
import { useCanvasZoom } from '../hooks/useCanvasZoom'
import { useCursorTracking } from '../hooks/useCursorTracking'
import { useShapeSelection } from '../hooks/useShapeSelection'
import RemoteCursor from './RemoteCursor'
import { getCursorStyle } from '../utils/canvasUtils'
import { Cursor, Shape } from '../types'
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
  onCursorMove?: (cursor: Cursor) => void
}

export default function Canvas({ tool, onToolChange, onCursorMove }: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  
  const { shapes, addShape, updateShape, removeShape } = useShapeStore()
  const { userId, color } = useUserStore()
  const { remoteCursors } = useCursorStore()

  // Custom hooks for different canvas behaviors
  const { isPanning, setIsPanning } = useCanvasPanning({ stageRef })
  
  const { handleMouseMove: handleCursorMove } = useCursorTracking({
    onCursorMove,
  })
  
  const {
    selectedShapeId,
    isDragging,
    handleShapeClick,
    handleStageClick,
    handleDragStart: handleSelectionDragStart,
    handleDragEnd: handleSelectionDragEnd,
    selectShape,
  } = useShapeSelection({
    onDelete: removeShape,
    tool,
  })
  
  // Handle shape creation and auto-select
  const handleShapeCreated = (shape: Shape) => {
    addShape(shape)
    selectShape(shape.id)
  }
  
  const {
    isDrawing,
    newShape,
    startCreating,
    updateSize,
    finishCreating,
  } = useShapeCreation({
    userId,
    color,
    onShapeCreated: handleShapeCreated,
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

  // Handle mouse move - update rectangle size while drawing and track cursor
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Track cursor position
    handleCursorMove(e)
    
    // Update shape being created
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

  // Handle shape mouse down (for panning and selection)
  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    const evt = e.evt
    
    // Middle mouse button - set panning state
    if (evt.button === 1) {
      setIsPanning(true)
      return
    }
    
    // Handle selection
    handleShapeClick(e, shapeId)
  }

  // Combined drag handlers
  const handleCombinedDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    handleSelectionDragStart()
    handleDragStart(e)
  }

  const handleCombinedDragEnd = () => {
    handleSelectionDragEnd()
    handleDragEnd()
  }

  return (
    <div
      className="w-full h-full bg-canvas-bg relative"
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
        onClick={handleStageClick}
        draggable={false}
      >
        <Layer>
          {/* Render all existing shapes */}
          {Object.values(shapes).map((shape) => {
            const isSelected = selectedShapeId === shape.id
            const showBorder = isSelected && !isDragging

            return (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={shape.color}
                opacity={SHAPE_OPACITY}
                draggable={tool === 'select'}
                onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
                onDragStart={handleCombinedDragStart}
                onDragMove={(e) => handleDragMove(e, shape)}
                onDragEnd={handleCombinedDragEnd}
                stroke={showBorder ? '#3b82f6' : undefined}
                strokeWidth={showBorder ? 2 : 0}
              />
            )
          })}

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

      {/* Render remote cursors */}
      {Object.values(remoteCursors).map((cursor) => (
        <RemoteCursor key={cursor.userId} cursor={cursor} />
      ))}
    </div>
  )
}
