import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import useCursorStore from '../stores/useCursorStore'
import RemoteCursor from './RemoteCursor'
import ShapeRenderer, { NewShapeRenderer } from './ShapeRenderer'
import DetailPane from './DetailPane'
import MultiSelectBox from './MultiSelectBox'
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
} from '../utils/canvasConstants'
import { getUserColorFromId } from '../utils/userColors'

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
  onBatchShapeLock?: (shapeIds: string[]) => void
  onBatchShapeUnlock?: (shapeIds: string[]) => void
  onDetailPaneVisibilityChange?: (isOpen: boolean) => void
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
  onBatchShapeLock,
  onBatchShapeUnlock,
  onDetailPaneVisibilityChange,
}: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [stageScale, setStageScale] = useState(1)
  const [currentCursor, setCurrentCursor] = useState<string>('default')
  const justFinishedManipulation = useRef(false)
  const isAltPressed = useRef(false)
  
  // Apply cursor to Konva container when it changes
  useEffect(() => {
    if (stageRef.current) {
      const container = stageRef.current.container()
      if (container) {
        container.style.cursor = currentCursor
      }
    }
  }, [currentCursor])
  
  const { shapes, updateShape } = useShapeStore()
  const { userId } = useUserStore()
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
    selectedShapeIds,
    selectedShapeId,
    isDragging,
    isSelecting,
    selectionBox,
    handleShapeClick,
    handleStageClick,
    handleDragStart: handleSelectionDragStart,
    handleDragEnd: handleSelectionDragEnd,
    selectShape,
    startSelection,
    updateSelection,
    finishSelection,
  } = useShapeSelection({
    onDelete: (shapeIds: string[]) => {
      // Delete all selected shapes
      shapeIds.forEach(id => onShapeDeleted?.(id))
    },
    onDeselect: (shapeId) => {
      // Unlock the shape when deselected
      onShapeUnlock?.(shapeId)
    },
    onDeselectAll: () => {
      // Unlock all selected shapes using batch operation if multiple
      if (selectedShapeIds.size > 1 && onBatchShapeUnlock) {
        onBatchShapeUnlock(Array.from(selectedShapeIds))
      } else {
        selectedShapeIds.forEach(id => onShapeUnlock?.(id))
      }
    },
    onToolChange: (newTool) => {
      // Switch to select tool when Escape is pressed
      onToolChange?.(newTool)
    },
    tool,
    userId,
  })
  
  // Handle shape creation and auto-select
  const handleShapeCreatedLocal = (shape: Shape) => {
    // If there are currently selected shapes, unlock them first
    if (selectedShapeIds.size > 1 && onBatchShapeUnlock) {
      onBatchShapeUnlock(Array.from(selectedShapeIds))
    } else if (selectedShapeIds.size > 0) {
      selectedShapeIds.forEach(id => onShapeUnlock?.(id))
    }
    
    // Create shape with lock already set to avoid flicker from separate lock write
    const lockedShape = { ...shape, lockedBy: userId }
    onShapeCreated?.(lockedShape)
    selectShape(shape.id)
    // No need to call onShapeLock separately - shape is already locked
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
      if (newTool === 'select' || newTool === 'rectangle' || newTool === 'circle' || newTool === 'line' || newTool === 'text') {
        onToolChange(newTool as Tool)
      }
    },
    shapeType: tool === 'rectangle' ? 'rectangle' : 
               tool === 'circle' ? 'circle' : 
               tool === 'line' ? 'line' : 
               tool === 'text' ? 'text' : 'rectangle',
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
    hoveredZone,
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

  // Handle mouse down - start creating shape, panning, or drag-to-select
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const evt = e.evt

    // Middle mouse button (button 1) - start panning
    if (evt.button === 1) {
      setIsPanning(true)
      setCurrentCursor('grabbing') // Update cursor immediately
      return
    }
    
    // Check if clicking in a manipulation zone of selected shape (prevents deselection)
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

    // Left mouse button with shape creation tools - start creating
    if ((tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'text') && evt.button === 0) {
      startCreating(e)
      return
    }
    
    // Left mouse button with select tool on stage (not on shape) - start drag-to-select
    if (tool === 'select' && evt.button === 0 && e.target === e.target.getStage()) {
      const stage = stageRef.current
      if (stage) {
        const pos = getPointerPosition(stage)
        if (pos) {
          startSelection(pos.x, pos.y)
        }
      }
    }
  }

  // Handle mouse move - update shape size, track cursor, drag-to-select, and handle manipulation
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Track cursor position
    handleCursorMove(e)
    
    // Update shape being created
    if (isDrawing) {
      updateSize(e)
      return
    }
    
    // Update drag-to-select box
    if (isSelecting) {
      const stage = stageRef.current
      if (stage) {
        const pos = getPointerPosition(stage)
        if (pos) {
          updateSelection(pos.x, pos.y)
        }
      }
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
    if (shape && tool === 'select' && selectedShapeIds.size === 1) {
      handleManipulationStageMouseMove(shape, pos.x, pos.y)
      setCurrentCursor(manipulationCursor)
      return
    }
    
    // Default cursor
    setCurrentCursor(getCursorStyle(isPanning, isDrawing, tool))
  }

  // Handle mouse up - finish creating, panning, manipulation, or drag-to-select
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
    
    // Finish drag-to-select
    if (isSelecting) {
      const shapesMap = new Map(Object.entries(shapes).map(([id, shape]) => [id, shape]))
      const newlySelectedIds = finishSelection(shapesMap)
      
      // Lock all newly selected shapes using batch operation (prevents race conditions)
      if (newlySelectedIds.size > 1 && onBatchShapeLock) {
        onBatchShapeLock(Array.from(newlySelectedIds))
      } else if (newlySelectedIds.size === 1) {
        newlySelectedIds.forEach(id => onShapeLock?.(id))
      }
      return
    }
    
    // Stop panning
    if (isPanning) {
      setIsPanning(false)
      setCurrentCursor(getCursorStyle(false, isDrawing, tool)) // Reset cursor immediately
    }

    // Finish creating shape
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
    
    // If this shape is in the current multi-selection, don't change selection
    // UNLESS shift is pressed (which means we want to toggle it off)
    if (selectedShapeIds.has(shapeId) && selectedShapeIds.size > 1 && tool === 'select' && !evt.shiftKey) {
      evt.stopPropagation() // Prevent stage click from deselecting
      return
    }
    
    // If this shape is the only selected shape, check for manipulation zones
    if (selectedShapeId === shapeId && selectedShapeIds.size === 1 && tool === 'select') {
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
    
    // Handle shift+click multi-select differently
    if (evt.shiftKey) {
      // Shift+click: toggle shape in/out of selection
      if (selectedShapeIds.has(shapeId)) {
        // Removing from selection: unlock this shape
        onShapeUnlock?.(shapeId)
      } else {
        // Adding to selection: lock this shape
        if (tool === 'select' && evt.button === 0) {
          onShapeLock?.(shapeId)
        }
      }
      handleShapeClick(e, shapeId)
    } else {
      // Regular click: replace selection
      // If switching selection, unlock the old shapes first
      if (selectedShapeIds.size > 0 && !selectedShapeIds.has(shapeId)) {
        if (selectedShapeIds.size > 1 && onBatchShapeUnlock) {
          onBatchShapeUnlock(Array.from(selectedShapeIds))
        } else {
          selectedShapeIds.forEach(id => onShapeUnlock?.(id))
        }
      }
      
      // Handle selection and lock the new shape
      handleShapeClick(e, shapeId)
      if (tool === 'select' && evt.button === 0) {
        onShapeLock?.(shapeId)
      }
    }
  }

  // Multi-select box drag handlers
  const handleMultiSelectDragStart = () => {
    handleSelectionDragStart()
  }

  const handleMultiSelectDragMove = (deltaX: number, deltaY: number) => {
    // Move all selected shapes by the delta
    selectedShapeIds.forEach(id => {
      const shape = shapes[id]
      if (shape) {
        // For lines, we need to move both (x,y) and (x2,y2) to maintain dimensions
        if (shape.type === 'line') {
          updateShape(id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY,
            x2: shape.x2 + deltaX,
            y2: shape.y2 + deltaY,
          })
        } else {
          updateShape(id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY,
          })
        }
      }
    })
  }

  const handleMultiSelectDragEnd = () => {
    handleSelectionDragEnd()
    
    // Persist all moved shapes to Firestore
    selectedShapeIds.forEach(id => {
      const updatedShape = shapes[id]
      if (updatedShape) {
        onShapeUpdate?.(updatedShape)
      }
    })
  }

  // Combined drag handlers - only used for single shape drag now
  const handleCombinedDragStart = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    handleSelectionDragStart()
    handleDragStart(e, shape)
    // Note: Shape should already be locked from mouse down, don't re-lock
  }

  const handleCombinedDragMove = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    // Single shape drag
    handleDragMove(e, shape)
  }

  const handleCombinedDragEnd = (shape: Shape) => {
    handleSelectionDragEnd()
    handleDragEnd(shape)
    // Note: Keep shape locked after drag - only unlock on deselect
  }
  
  // Handle stage click - unlock any selected shapes
  const handleStageClickWithUnlock = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Don't deselect if we're currently in an operation or just finished one
    const isOperating = justFinishedManipulation.current ||
                       isPanning ||
                       isDrawing ||
                       isManipulating ||
                       isDragging ||
                       isSelecting

    if (isOperating) {
      return
    }
    
    // Get the currently selected shapes before deselecting
    const currentSelectedIds = new Set(selectedShapeIds)
    
    // Deselect first (updates local state)
    handleStageClick(e)
    
    // Only unlock if we clicked the stage background (not a shape)
    // This prevents unlocking when clicking an already-selected shape
    if (currentSelectedIds.size > 0 && e.target === e.target.getStage()) {
      if (currentSelectedIds.size > 1 && onBatchShapeUnlock) {
        onBatchShapeUnlock(Array.from(currentSelectedIds))
      } else {
        currentSelectedIds.forEach(id => onShapeUnlock?.(id))
      }
    }
  }
  
  // Use refs to avoid recreating the callback
  const shapesRef = useRef(shapes)
  const onShapeUpdateRef = useRef(onShapeUpdate)
  const updateShapeRef = useRef(updateShape)
  
  useEffect(() => {
    shapesRef.current = shapes
    onShapeUpdateRef.current = onShapeUpdate
    updateShapeRef.current = updateShape
  })

  // Detail pane handler - stable reference for proper debouncing
  const handleDetailPaneUpdate = useCallback((updates: Partial<Shape>) => {
    if (!selectedShapeId) return
    
    const currentShape = shapesRef.current[selectedShapeId]
    if (!currentShape) return
    
    // Merge updates with current shape
    const updatedShape = { ...currentShape, ...updates } as Shape
    
    // Update local store
    updateShapeRef.current(selectedShapeId, updates)
    
    // Sync to Firebase with the fully updated shape
    onShapeUpdateRef.current?.(updatedShape)
  }, [selectedShapeId])
  
  const handleCloseDetailPane = () => {
    const currentSelectedId = selectedShapeId
    
    // Deselect the shape
    selectShape('')
    
    // Unlock the shape if we had it selected
    if (currentSelectedId) {
      onShapeUnlock?.(currentSelectedId)
    }
  }
  
  // Track detail pane visibility for parent component
  useEffect(() => {
    const isDetailPaneVisible = !!(selectedShapeId && selectedShapeIds.size === 1 && shapes[selectedShapeId])
    onDetailPaneVisibilityChange?.(isDetailPaneVisible)
  }, [selectedShapeId, selectedShapeIds.size, shapes, onDetailPaneVisibilityChange])

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
            const isSelected = selectedShapeIds.has(shape.id)
            const isLockedByMe = shape.lockedBy === userId
            const isLockedByOther = !!(shape.lockedBy && shape.lockedBy !== userId)
            
            // Get the remote user's color if locked by another user
            const remoteUserColor = shape.lockedBy && shape.lockedBy !== userId 
              ? getUserColorFromId(shape.lockedBy) 
              : undefined

            // Disable manipulation UI and dragging for multi-select (will use MultiSelectBox instead)
            const showManipulationUI = isSelected && selectedShapeIds.size === 1
            const isInMultiSelect = selectedShapeIds.size > 1 && isSelected

            // Render shape using ShapeRenderer
            return (
              <ShapeRenderer
                key={shape.id}
                shape={shape}
                // Show selection for single select, also show for multi-select for visual consistency
                isSelected={isSelected && isLockedByMe}
                isLockedByMe={isLockedByMe}
                isLockedByOther={isLockedByOther && !isInMultiSelect} // Hide border for multi-select, show for others' locks
                isManipulating={isManipulating}
                isHoveringManipulationZone={showManipulationUI && hoveredZone !== null && hoveredZone !== 'center'}
                isInMultiSelect={isInMultiSelect}
                stageScale={stageScale}
                remoteUserColor={remoteUserColor}
                onMouseDown={handleShapeMouseDown}
                onMouseMove={handleManipulationMouseMove}
                onMouseLeave={handleShapeMouseLeave}
                onDragStart={handleCombinedDragStart}
                onDragMove={handleCombinedDragMove}
                onDragEnd={handleCombinedDragEnd}
              />
            )
          })}

          {/* Render shape being created */}
          {newShape && <NewShapeRenderer shape={newShape} />}
          
          {/* Render drag-to-select box */}
          {isSelecting && selectionBox && (
            <Rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(0, 122, 255, 0.1)"
              stroke="rgba(0, 122, 255, 0.6)"
              strokeWidth={2 / stageScale}
              dash={[4 / stageScale, 4 / stageScale]}
              listening={false}
            />
          )}

          {/* Render multi-select bounding box */}
          {selectedShapeIds.size > 1 && (
            <MultiSelectBox
              shapes={Array.from(selectedShapeIds).map(id => shapes[id]).filter(Boolean)}
              stageScale={stageScale}
              userId={userId}
              onDragStart={handleMultiSelectDragStart}
              onDragMove={handleMultiSelectDragMove}
              onDragEnd={handleMultiSelectDragEnd}
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
      
      {/* Detail Pane - show only when a single shape is selected */}
      {selectedShapeId && selectedShapeIds.size === 1 && shapes[selectedShapeId] && (
        <DetailPane
          shape={shapes[selectedShapeId]}
          onClose={handleCloseDetailPane}
          onUpdateShape={handleDetailPaneUpdate}
        />
      )}
    </div>
  )
}
