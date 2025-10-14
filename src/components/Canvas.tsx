import { useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import RemoteCursor from './RemoteCursor'
import { useCanvasPanning } from '../hooks/useCanvasPanning'
import { useShapeCreation } from '../hooks/useShapeCreation'
import { useShapeDragging } from '../hooks/useShapeDragging'
import { useCanvasZoom } from '../hooks/useCanvasZoom'
import { useCursorTracking } from '../hooks/useCursorTracking'
import { useShapeSelection } from '../hooks/useShapeSelection'
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
  onShapeCreated?: (shape: Shape) => void
  onShapeDeleted?: (shapeId: string) => void
  onShapeLock?: (shapeId: string) => void
  onShapeUnlock?: (shapeId: string) => void
  onlineUsers: import('../types').User[]
}

export default function Canvas({
  tool,
  onToolChange,
  onCursorMove,
  onShapeCreated,
  onShapeDeleted,
  onShapeLock,
  onShapeUnlock,
  onlineUsers,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  
  const { shapes, updateShape } = useShapeStore()
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
    onDelete: onShapeDeleted,
    tool,
  })
  
  // Handle shape creation and auto-select
  const handleShapeCreatedLocal = (shape: Shape) => {
    onShapeCreated?.(shape)
    selectShape(shape.id)
    onShapeLock?.(shape.id) // Lock the shape when created
  }
  
  const {
    isDrawing,
    newShape,
    startCreating,
    updateSize,
    finishCreating,
  } = useShapeCreation({
    userId,
    onShapeCreated: handleShapeCreatedLocal,
    onToolChange,
  })
  
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useShapeDragging({
    isPanning,
    updateShape,
    onDragUpdate: (id, updates) => {
      // Sync shape position to Firestore during drag
      onShapeCreated?.({ ...shapes[id], ...updates })
    },
  })
  
  const { handleWheel } = useCanvasZoom({
    onScaleChange: setStageScale,
  })

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
  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string, isLockedByOther: boolean) => {
    const evt = e.evt
    
    // Middle mouse button - set panning state
    if (evt.button === 1) {
      setIsPanning(true)
      return
    }
    
    // Don't allow selection of shapes locked by other users
    if (isLockedByOther) {
      evt.stopPropagation() // Prevent stage click
      return
    }
    
    // If this shape is already selected, don't re-lock BUT stop event propagation
    // so it doesn't trigger stage click (which would deselect)
    if (selectedShapeId === shapeId) {
      evt.stopPropagation() // Prevent stage click from deselecting
      return
    }
    
    // Handle selection and lock
    handleShapeClick(e, shapeId)
    if (tool === 'select' && evt.button === 0) {
      onShapeLock?.(shapeId)
    }
  }

  // Combined drag handlers
  const handleCombinedDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    handleSelectionDragStart()
    handleDragStart(e)
    // Note: Shape should already be locked from mouse down, don't re-lock
  }

  const handleCombinedDragEnd = () => {
    handleSelectionDragEnd()
    handleDragEnd()
    // Note: Keep shape locked after drag - only unlock on deselect
  }
  
  // Handle stage click - unlock any selected shape
  const handleStageClickWithUnlock = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Get the currently selected shape before deselecting
    const currentSelectedId = selectedShapeId
    
    // Deselect first (updates local state)
    handleStageClick(e)
    
    // Only unlock if we clicked the stage background (not a shape)
    // This prevents unlocking when clicking an already-selected shape
    if (currentSelectedId && e.target === e.target.getStage()) {
      onShapeUnlock?.(currentSelectedId)
    }
  }
  
  // Get user color by userId
  const getUserColor = (userId: string): string => {
    const user = onlineUsers.find(u => u.userId === userId)
    return user?.color || '#666666'
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
        onClick={handleStageClickWithUnlock}
        draggable={false}
      >
        <Layer>
          {/* Render all existing shapes */}
          {Object.values(shapes).map((shape) => {
            const isSelected = selectedShapeId === shape.id
            const isLockedByMe = shape.lockedBy === userId
            const isLockedByOther = !!(shape.lockedBy && shape.lockedBy !== userId)
            
            // Border logic:
            // - Show blue border if: I selected it AND I own the lock AND not currently dragging
            // - Show colored border if: locked by another user (always visible)
            const showLocalBorder = isSelected && isLockedByMe && !isDragging
            const showRemoteBorder = isLockedByOther
            
            const borderColor = showRemoteBorder 
              ? getUserColor(shape.lockedBy!) 
              : '#3b82f6'
            const showBorder = showLocalBorder || showRemoteBorder

            // Can only drag if not locked by another user
            const canDrag = tool === 'select' && !isLockedByOther

            return (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={shape.color}
                opacity={SHAPE_OPACITY}
                draggable={canDrag}
                onMouseDown={(e) => handleShapeMouseDown(e, shape.id, isLockedByOther)}
                onDragStart={handleCombinedDragStart}
                onDragMove={(e) => handleDragMove(e, shape)}
                onDragEnd={handleCombinedDragEnd}
                stroke={showBorder ? borderColor : undefined}
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
              fill="#D1D5DB"
              opacity={NEW_SHAPE_OPACITY}
              stroke={color}
              strokeWidth={NEW_SHAPE_STROKE_WIDTH}
              dash={NEW_SHAPE_DASH}
            />
          )}

          {/* Render remote cursors inside the canvas layer */}
          {Object.values(remoteCursors).map((cursor) => (
            <RemoteCursor 
              key={cursor.userId} 
              cursor={cursor} 
              stageScale={stageScale}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}
