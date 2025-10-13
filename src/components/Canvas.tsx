import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import useShapeStore from '../stores/useShapeStore'
import useUserStore from '../stores/useUserStore'
import { Shape } from '../types'

type Tool = 'select' | 'rectangle'

interface CanvasProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
}

export default function Canvas({ tool, onToolChange }: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [newShape, setNewShape] = useState<Shape | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [isDraggingShape, setIsDraggingShape] = useState(false)
  
  const { shapes, addShape, updateShape, lockShape, unlockShape } = useShapeStore()
  const { userId, color } = useUserStore()

  // Set up document-level listeners for panning (to handle mouse leaving window)
  useEffect(() => {
    const handleDocumentMouseUp = () => {
      if (isPanning) {
        setIsPanning(false)
      }
    }

    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isPanning && stageRef.current) {
        const stage = stageRef.current
        const dx = e.movementX
        const dy = e.movementY
        
        const oldPos = stage.position()
        stage.position({
          x: oldPos.x + dx,
          y: oldPos.y + dy,
        })
      }
    }

    if (isPanning) {
      document.addEventListener('mouseup', handleDocumentMouseUp)
      document.addEventListener('mousemove', handleDocumentMouseMove)
    }

    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp)
      document.removeEventListener('mousemove', handleDocumentMouseMove)
    }
  }, [isPanning])

  // Handle mouse down - start creating rectangle, panning, or selecting
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const evt = e.evt

    // Middle mouse button (button 1) - start panning
    if (evt.button === 1) {
      setIsPanning(true)
      return
    }

    // Left mouse button with rectangle tool - start creating
    if (tool === 'rectangle' && evt.button === 0) {
      const stage = e.target.getStage()
      if (!stage) return

      const pos = stage.getRelativePointerPosition()
      if (!pos) return

      // Start creating a new rectangle
      const id = `shape-${Date.now()}-${Math.random()}`
      const shape: Shape = {
        id,
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: color,
        createdBy: userId!,
        lockedBy: null,
      }

      setNewShape(shape)
      setIsDrawing(true)
    }
  }

  // Handle clicking on stage background (deselect)
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if we clicked on the stage itself (not on a shape)
    if (e.target === e.target.getStage()) {
      setSelectedShapeId(null)
    }
  }


  // Handle mouse move - update rectangle size while drawing
  // Note: Panning is now handled by document-level listeners for better behavior
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    // Handle rectangle drawing
    if (isDrawing && newShape) {
      const pos = stage.getRelativePointerPosition()
      if (!pos) return

      // Update rectangle size
      const width = pos.x - newShape.x
      const height = pos.y - newShape.y

      setNewShape({
        ...newShape,
        width,
        height,
      })
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
    if (isDrawing && newShape) {
      // Only add shape if it has meaningful size
      if (Math.abs(newShape.width) > 5 && Math.abs(newShape.height) > 5) {
        // Normalize negative dimensions
        const normalizedShape = {
          ...newShape,
          x: newShape.width < 0 ? newShape.x + newShape.width : newShape.x,
          y: newShape.height < 0 ? newShape.y + newShape.height : newShape.y,
          width: Math.abs(newShape.width),
          height: Math.abs(newShape.height),
        }
        addShape(normalizedShape)
        
        // Auto-select the newly created rectangle
        setSelectedShapeId(normalizedShape.id)
        
        // Auto-switch back to select tool after creating rectangle
        onToolChange('select')
      }

      setNewShape(null)
      setIsDrawing(false)
    }
  }

  // Handle shape mouse down (for selection)
  const handleShapeMouseDown = (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string) => {
    const evt = e.evt
    
    // Middle mouse button - set panning state but don't select
    if (evt.button === 1) {
      setIsPanning(true)
      return
    }
    
    // Select on left mouse button with select tool
    if (evt.button === 0 && tool === 'select') {
      setSelectedShapeId(shapeId)
    }
  }

  // Handle shape drag start
  const handleShapeDragStart = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    // Prevent shape drag if middle mouse button is being used for panning
    // Check both isPanning state AND the actual mouse button to handle timing issues
    if (isPanning || e.evt.button === 1) {
      e.target.stopDrag()
      return
    }
    
    if (!userId) return
    
    // Shape is already selected from mousedown, just start dragging
    setIsDraggingShape(true)
    lockShape(shape.id, userId)
  }

  // Handle shape drag move
  const handleShapeDragMove = (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => {
    if (!userId) return

    const node = e.target
    updateShape(shape.id, userId, {
      x: node.x(),
      y: node.y(),
    })
  }

  // Handle shape drag end
  const handleShapeDragEnd = (shape: Shape) => {
    setIsDraggingShape(false)
    unlockShape(shape.id)
    // Keep the shape selected after dragging
    setSelectedShapeId(shape.id)
  }

  // Handle mouse wheel - pan vertically or zoom with ctrl
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const stage = e.target.getStage()
    if (!stage) return

    const evt = e.evt

    // Ctrl+wheel = zoom
    if (evt.ctrlKey) {
      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }

      const scaleBy = 1.1
      const newScale = evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
      
      // Limit zoom
      const limitedScale = Math.max(0.1, Math.min(5, newScale))

      stage.scale({ x: limitedScale, y: limitedScale })

      const newPos = {
        x: pointer.x - mousePointTo.x * limitedScale,
        y: pointer.y - mousePointTo.y * limitedScale,
      }
      stage.position(newPos)
    } else {
      // Regular wheel = pan vertically
      const dy = evt.deltaY
      const oldPos = stage.position()
      stage.position({
        x: oldPos.x,
        y: oldPos.y - dy,
      })
    }
  }

  // Determine cursor style based on state
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing' // Middle-click panning
    if (isDrawing) return 'crosshair' // Creating rectangle
    if (tool === 'rectangle') return 'crosshair' // Rectangle tool active
    return 'default' // Select tool - default pointer
  }

  return (
    <div className="w-full h-full bg-canvas-bg" style={{ cursor: getCursorStyle() }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight - 64} // Subtract header height
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
            const showBorder = isSelected && !isDraggingShape

            return (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={shape.color}
                opacity={0.8}
                draggable={tool === 'select'}
                onMouseDown={(e) => handleShapeMouseDown(e, shape.id)}
                onDragStart={(e) => handleShapeDragStart(e, shape)}
                onDragMove={(e) => handleShapeDragMove(e, shape)}
                onDragEnd={() => handleShapeDragEnd(shape)}
                // Show light blue border when selected (but not during drag)
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
              opacity={0.5}
              stroke={color}
              strokeWidth={2}
              dash={[5, 5]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  )
}

