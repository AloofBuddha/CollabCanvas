import { useRef, useState, useEffect, Fragment } from 'react'
import { Stage, Layer, Rect, Ellipse } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import RemoteCursor from './RemoteCursor'
import ShapeDimensionLabel from './ShapeDimensionLabel'
import { useCanvasPanning } from '../hooks/useCanvasPanning'
import { useShapeCreation } from '../hooks/useShapeCreation'
import { useShapeDragging } from '../hooks/useShapeDragging'
import { useCanvasZoom } from '../hooks/useCanvasZoom'
import { useCursorTracking } from '../hooks/useCursorTracking'
import { useShapeSelection } from '../hooks/useShapeSelection'
import { useShapeManipulation } from '../hooks/useShapeManipulation'
import { getCursorStyle } from '../utils/canvasUtils'
import { Cursor, Shape } from '../types'
import { detectManipulationZone, getPointerPosition } from '../utils/shapeManipulation'
import {
  HEADER_HEIGHT,
  SHAPE_OPACITY,
  NEW_SHAPE_OPACITY,
  NEW_SHAPE_STROKE_WIDTH,
  NEW_SHAPE_DASH,
} from '../utils/canvasConstants'

type Tool = 'select' | 'rectangle' | 'circle' | 'line' | 'text'

interface CanvasProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
  onCursorMove?: (cursor: Cursor) => void
  onShapeCreated?: (shape: Shape) => void
  onShapeDeleted?: (shapeId: string) => void
  onShapeUpdate?: (shape: Shape) => void // For drag/manipulation end -> Firestore persistence
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
  onShapeUpdate,
  onShapeLock,
  onShapeUnlock,
  onlineUsers,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [currentCursor, setCurrentCursor] = useState<string>('default')
  const justFinishedManipulation = useRef(false)
  const isAltPressed = useRef(false)
  
  const { shapes, updateShape } = useShapeStore()
  const { userId, color } = useUserStore()
  const { remoteCursors } = useCursorStore()

  // Track Alt key state for duplication
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        isAltPressed.current = true
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        isAltPressed.current = false
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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
    // If there's a currently selected shape, unlock it first
    if (selectedShapeId) {
      onShapeUnlock?.(selectedShapeId)
    }
    
    onShapeCreated?.(shape)
    selectShape(shape.id)
    onShapeLock?.(shape.id) // Lock the newly created shape
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
    onToolChange: (newTool) => {
      if (newTool === 'select' || newTool === 'rectangle' || newTool === 'circle') {
        onToolChange(newTool as Tool)
      }
    },
    shapeType: tool === 'rectangle' ? 'rectangle' : tool === 'circle' ? 'circle' : 'rectangle',
  })
  
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useShapeDragging({
    isPanning,
    isAltPressed,
    updateShape,
    onCursorMove, // Track cursor position during drag
    onShapeCreated, // For creating duplicates
    onDragEnd: onShapeUpdate, // Persist to Firestore on drag end
  })
  
  const { handleWheel } = useCanvasZoom({
    onScaleChange: setStageScale,
  })
  
  // Shape manipulation (resize & rotate)
  const {
    isManipulating,
    currentCursor: manipulationCursor,
    handleShapeMouseMove: handleManipulationMouseMove,
    handleStageMouseMove: handleManipulationStageMouseMove,
    handleShapeMouseLeave,
    startManipulation,
    updateManipulation,
    endManipulation,
  } = useShapeManipulation({
    selectedShapeId,
    updateShape,
    onShapeUpdate, // Persist to Firestore on manipulation end
    stageRef,
    stageScale,
  })

  // Handle mouse down - start creating rectangle or panning
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const evt = e.evt

    // Middle mouse button (button 1) - start panning
    if (evt.button === 1) {
      setIsPanning(true)
      setCurrentCursor('grabbing') // Update cursor immediately
      return
    }
    
    // Check if clicking in a rotation zone of selected shape (prevents deselection)
    if (selectedShapeId && tool === 'select' && evt.button === 0) {
      const stage = stageRef.current
      const pos = stage ? getPointerPosition(stage) : null
      const shape = selectedShapeId ? shapes[selectedShapeId] : null
      
      if (stage && pos && shape) {
        const hit = detectManipulationZone(shape, pos.x, pos.y, stageScale)
        
        // If in a rotation zone, start manipulation and prevent deselection
        if (hit.zone.includes('rotate')) {
          const started = startManipulation(e, shape, hit.zone)
          if (started) {
            e.cancelBubble = true
            return
          }
        }
      }
    }

    // Left mouse button with rectangle or circle tool - start creating
    if ((tool === 'rectangle' || tool === 'circle') && evt.button === 0) {
      startCreating(e)
    }
  }

  // Handle mouse move - update rectangle size while drawing, track cursor, and handle manipulation
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Track cursor position
    handleCursorMove(e)
    
    // Update shape being created
    if (isDrawing) {
      updateSize(e)
      return
    }
    
    // Get current mouse position and shape
    const stage = stageRef.current
    const pos = stage ? getPointerPosition(stage) : null
    const shape = selectedShapeId ? shapes[selectedShapeId] : null
    
    if (!stage || !pos) {
      return
    }
    
    // Update manipulation (resize/rotate) if manipulating
    if (isManipulating && shape) {
      updateManipulation(pos.x, pos.y, shape)
      return
    }
    
    // Panning has highest priority for cursor (even if shape is selected)
    if (isPanning) {
      setCurrentCursor('grabbing')
      return
    }
    
    // Check for manipulation zones on selected shape (for rotation zones outside shape)
    if (shape && tool === 'select') {
      handleManipulationStageMouseMove(shape, pos.x, pos.y)
      setCurrentCursor(manipulationCursor)
      return
    }
    
    // Default cursor
    setCurrentCursor(getCursorStyle(isPanning, isDrawing, tool))
  }

  // Handle mouse up - finish creating rectangle, panning, or manipulation
  const handleMouseUp = () => {
    // Check if we're ending any operation that should prevent deselection
    const wasOperating = isPanning || isDrawing || isManipulating || isDragging
    
    // CRITICAL: Set the flag IMMEDIATELY before any other logic
    // This ensures it's set before onClick can fire on the Stage
    if (wasOperating) {
      justFinishedManipulation.current = true
      // Clear the flag after a short delay
      setTimeout(() => {
        justFinishedManipulation.current = false
      }, 100)
    }
    
    // Stop panning
    if (isPanning) {
      setIsPanning(false)
      setCurrentCursor(getCursorStyle(false, isDrawing, tool)) // Reset cursor immediately
    }

    // Finish creating rectangle
    if (isDrawing) {
      finishCreating()
    }
    
    // Finish manipulation
    if (isManipulating) {
      endManipulation()
    }
  }

  // Handle shape mouse down (for panning, selection, and manipulation)
  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string, isLockedByOther: boolean, shape: Shape) => {
    const evt = e.evt
    
    // Middle mouse button - set panning state
    if (evt.button === 1) {
      setIsPanning(true)
      setCurrentCursor('grabbing') // Update cursor immediately
      return
    }
    
    // Don't allow selection of shapes locked by other users
    if (isLockedByOther) {
      evt.stopPropagation() // Prevent stage click
      return
    }
    
    // If this shape is already selected, check for manipulation zones
    if (selectedShapeId === shapeId && tool === 'select') {
      evt.stopPropagation() // Prevent stage click from deselecting
      
      const stage = stageRef.current
      if (stage) {
        const pos = getPointerPosition(stage)
        if (pos) {
          const hit = detectManipulationZone(shape, pos.x, pos.y, stageScale)
          
          // Start manipulation if not in center zone
          if (hit.zone !== 'center') {
            const started = startManipulation(e, shape, hit.zone)
            if (started) {
              // Prevent dragging when manipulating
              e.cancelBubble = true
              return
            }
          }
        }
      }
      return
    }
    
    // If switching selection, unlock the old shape first
    if (selectedShapeId && selectedShapeId !== shapeId) {
      onShapeUnlock?.(selectedShapeId)
    }
    
    // Handle selection and lock the new shape
    handleShapeClick(e, shapeId)
    if (tool === 'select' && evt.button === 0) {
      onShapeLock?.(shapeId)
    }
  }

  // Combined drag handlers
  const handleCombinedDragStart = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    handleSelectionDragStart()
    handleDragStart(e, shape)
    // Note: Shape should already be locked from mouse down, don't re-lock
  }

  const handleCombinedDragEnd = (shape: Shape) => {
    handleSelectionDragEnd()
    handleDragEnd(shape)
    // Note: Keep shape locked after drag - only unlock on deselect
  }
  
  // Handle stage click - unlock any selected shape
  const handleStageClickWithUnlock = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Don't deselect if we're currently in an operation or just finished one
    const isOperating = justFinishedManipulation.current ||
                       isPanning ||
                       isDrawing ||
                       isManipulating ||
                       isDragging

    if (isOperating) {
      return
    }
    
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
      style={{ cursor: currentCursor }}
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
            // - Show blue border if: I selected it AND I own the lock AND not currently manipulating
            // - Show colored border if: locked by another user (always visible)
            const showLocalBorder = isSelected && isLockedByMe && !isManipulating
            const showRemoteBorder = isLockedByOther
            
            const borderColor = showRemoteBorder 
              ? getUserColor(shape.lockedBy!) 
              : '#3b82f6'
            const showBorder = showLocalBorder || showRemoteBorder

            // Can only drag if not locked by another user and not manipulating
            const canDrag = tool === 'select' && !isLockedByOther && !isManipulating

            // Render shape based on type
            if (shape.type === 'rectangle') {
              return (
                <Fragment key={shape.id}>
                  <Rect
                    x={shape.x + shape.width / 2}
                    y={shape.y + shape.height / 2}
                    width={shape.width}
                    height={shape.height}
                    rotation={shape.rotation || 0}
                    offsetX={shape.width / 2}
                    offsetY={shape.height / 2}
                    fill={shape.color}
                    opacity={SHAPE_OPACITY}
                    draggable={canDrag}
                    onMouseDown={(e) => handleShapeMouseDown(e, shape.id, isLockedByOther, shape)}
                    onMouseMove={(e) => handleManipulationMouseMove(e, shape, isSelected)}
                    onMouseLeave={handleShapeMouseLeave}
                    onDragStart={(e) => handleCombinedDragStart(e, shape)}
                    onDragMove={(e) => handleDragMove(e, shape)}
                    onDragEnd={() => handleCombinedDragEnd(shape)}
                    stroke={showBorder ? borderColor : undefined}
                    strokeWidth={showBorder ? 2 : 0}
                  />
                  {/* Show dimension label for selected shape */}
                  {isSelected && isLockedByMe && !isManipulating && (
                    <ShapeDimensionLabel 
                      key={`${shape.id}-label`}
                      shape={shape} 
                      stageScale={stageScale} 
                    />
                  )}
                </Fragment>
              )
            } else if (shape.type === 'circle') {
              return (
                <Fragment key={shape.id}>
                  <Ellipse
                    x={shape.x + shape.radiusX}
                    y={shape.y + shape.radiusY}
                    radiusX={shape.radiusX}
                    radiusY={shape.radiusY}
                    rotation={shape.rotation || 0}
                    fill={shape.color}
                    opacity={SHAPE_OPACITY}
                    draggable={canDrag}
                    onMouseDown={(e) => handleShapeMouseDown(e, shape.id, isLockedByOther, shape)}
                    onMouseMove={(e) => handleManipulationMouseMove(e, shape, isSelected)}
                    onMouseLeave={handleShapeMouseLeave}
                    onDragStart={(e) => handleCombinedDragStart(e, shape)}
                    onDragMove={(e) => handleDragMove(e, shape)}
                    onDragEnd={() => handleCombinedDragEnd(shape)}
                    stroke={showBorder ? borderColor : undefined}
                    strokeWidth={showBorder ? 2 : 0}
                  />
                  {/* Show dimension label for selected shape */}
                  {isSelected && isLockedByMe && !isManipulating && (
                    <ShapeDimensionLabel 
                      key={`${shape.id}-label`}
                      shape={shape} 
                      stageScale={stageScale} 
                    />
                  )}
                </Fragment>
              )
            }
            return null
          })}

          {/* Render shape being created */}
          {newShape && (
            newShape.type === 'rectangle' ? (
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
            ) : newShape.type === 'circle' ? (
              <Ellipse
                x={newShape.x + newShape.radiusX}
                y={newShape.y + newShape.radiusY}
                radiusX={newShape.radiusX}
                radiusY={newShape.radiusY}
                fill="#D1D5DB"
                opacity={NEW_SHAPE_OPACITY}
                stroke={color}
                strokeWidth={NEW_SHAPE_STROKE_WIDTH}
                dash={NEW_SHAPE_DASH}
              />
            ) : null
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
