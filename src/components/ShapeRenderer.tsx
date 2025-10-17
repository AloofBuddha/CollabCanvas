/**
 * ShapeRenderer - Unified shape rendering component
 * 
 * This component eliminates duplication by providing a single interface
 * for rendering all shape types with their specific Konva components.
 */

import { Fragment } from 'react'
import { Rect, Ellipse, Line, Text as KonvaText, Group, Circle } from 'react-konva'
import Konva from 'konva'
import { Shape, RectangleShape, CircleShape, LineShape, TextShape } from '../types'
import ShapeDimensionLabel from './ShapeDimensionLabel'
import {
  SELECTION_COLOR_LOCAL,
  SELECTION_COLOR_REMOTE_FALLBACK,
  LINE_HANDLE_FILL,
  LINE_HANDLE_STROKE,
  NEW_SHAPE_COLOR,
} from '../constants'

interface ShapeRendererProps {
  shape: Shape
  isSelected: boolean
  isLockedByMe: boolean
  isLockedByOther: boolean
  isManipulating: boolean
  isHoveringManipulationZone: boolean // True when hovering over resize/rotate handles
  isInMultiSelect: boolean // True when shape is part of a multi-selection
  stageScale: number
  remoteUserColor?: string // Color of the remote user who locked this shape
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string, isLockedByOther: boolean, shape: Shape) => void
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, shape: Shape, isSelected: boolean) => void
  onMouseLeave: () => void
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => void
  onDragEnd: (shape: Shape) => void
  onDoubleClick?: (shapeId: string, shape: Shape) => void
}

export default function ShapeRenderer({
  shape,
  isSelected,
  isLockedByMe,
  isLockedByOther,
  isManipulating,
  isHoveringManipulationZone,
  isInMultiSelect,
  stageScale,
  remoteUserColor,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDoubleClick,
}: ShapeRendererProps) {
  // Disable drag when hovering over manipulation zones (resize/rotate handles)
  // or when already manipulating
  const canDrag = !isLockedByOther && !isHoveringManipulationZone && !isManipulating
  const showBorder = (isSelected && isLockedByMe && !isManipulating) || isLockedByOther
  const borderColor = isLockedByMe ? SELECTION_COLOR_LOCAL : (remoteUserColor || SELECTION_COLOR_REMOTE_FALLBACK)

  // Scaled border width - gentler curve than pure inverse, with minimum threshold
  // This makes borders smaller when zoomed out and larger when zoomed in
  const inverseBorderWidth = Math.max(2, 4 * Math.pow(stageScale, -0.6))

  // Get shape opacity (default to 1.0 if not set)
  const shapeOpacity = shape.opacity ?? 1.0

  const renderShape = () => {
    switch (shape.type) {
      case 'rectangle': {
        const rect = shape as RectangleShape
        const shapeStrokeWidth = rect.strokeWidth || 0
        // Selection border should appear directly outside the shape's own border (no gap)
        // Both strokes are centered on their paths:
        // - Shape border extends shapeStrokeWidth/2 outward
        // - Selection border extends inverseBorderWidth/2 inward from its path
        // So we need: shapeStrokeWidth/2 + inverseBorderWidth/2
        const selectionPadding = shapeStrokeWidth / 2 + inverseBorderWidth / 2
        const selectionWidth = rect.width + selectionPadding * 2
        const selectionHeight = rect.height + selectionPadding * 2
        
        return (
          <Group
            x={rect.x + rect.width / 2}
            y={rect.y + rect.height / 2}
            rotation={shape.rotation || 0}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
          >
            <Rect
              x={0}
              y={0}
              width={rect.width}
              height={rect.height}
              offsetX={rect.width / 2}
              offsetY={rect.height / 2}
              fill={rect.color}
              opacity={shapeOpacity}
              stroke={rect.stroke}
              strokeWidth={shapeStrokeWidth}
            />
            {showBorder && (
              <Rect
                x={0}
                y={0}
                width={selectionWidth}
                height={selectionHeight}
                offsetX={selectionWidth / 2}
                offsetY={selectionHeight / 2}
                stroke={borderColor}
                strokeWidth={inverseBorderWidth}
                dash={[8 / stageScale, 4 / stageScale]} // Dashed pattern scales with zoom
                fill="transparent"
              />
            )}
          </Group>
        )
      }
      
      case 'circle': {
        const circle = shape as CircleShape
        const shapeStrokeWidth = circle.strokeWidth || 0
        // Selection border should appear directly outside the shape's own border (no gap)
        // Both strokes are centered on their paths:
        // - Shape border extends shapeStrokeWidth/2 outward
        // - Selection border extends inverseBorderWidth/2 inward from its path
        // So we need: shapeStrokeWidth/2 + inverseBorderWidth/2
        const selectionPadding = shapeStrokeWidth / 2 + inverseBorderWidth / 2
        const selectionRadiusX = circle.radiusX + selectionPadding
        const selectionRadiusY = circle.radiusY + selectionPadding
        
        return (
          <Group
            x={circle.x + circle.radiusX}
            y={circle.y + circle.radiusY}
            rotation={shape.rotation || 0}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
          >
            <Ellipse
              radiusX={circle.radiusX}
              radiusY={circle.radiusY}
              fill={circle.color}
              opacity={shapeOpacity}
              stroke={circle.stroke}
              strokeWidth={shapeStrokeWidth}
            />
            {showBorder && (
              <Ellipse
                radiusX={selectionRadiusX}
                radiusY={selectionRadiusY}
                stroke={borderColor}
                strokeWidth={inverseBorderWidth}
                dash={[8 / stageScale, 4 / stageScale]} // Dashed pattern scales with zoom
                fill="transparent"
              />
            )}
          </Group>
        )
      }
      
      case 'line': {
        const line = shape as LineShape
        // Calculate center point for drag offset
        const centerX = (line.x + line.x2) / 2
        const centerY = (line.y + line.y2) / 2
        // Points relative to center
        const points = [
          line.x - centerX, 
          line.y - centerY, 
          line.x2 - centerX, 
          line.y2 - centerY
        ]
        
        return (
          <Group
            x={centerX}
            y={centerY}
            rotation={shape.rotation || 0}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
          >
            {/* Border/selection indicator for line */}
            {showBorder && (
              <Line
                points={points}
                stroke={borderColor}
                strokeWidth={line.strokeWidth + (4 / stageScale)}
                dash={[8 / stageScale, 4 / stageScale]} // Dashed pattern scales with zoom
                opacity={0.5}
                listening={false}
              />
            )}
            {/* Actual line */}
            <Line
              points={points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              opacity={shapeOpacity}
            />
            {/* Endpoint handles - only show when selected */}
            {isSelected && isLockedByMe && (
              <Fragment>
                {/* Start point handle */}
                <Circle
                  x={points[0]}
                  y={points[1]}
                  radius={6 / stageScale}
                  fill={LINE_HANDLE_FILL}
                  stroke={LINE_HANDLE_STROKE}
                  strokeWidth={2 / stageScale}
                />
                {/* End point handle */}
                <Circle
                  x={points[2]}
                  y={points[3]}
                  radius={6 / stageScale}
                  fill={LINE_HANDLE_FILL}
                  stroke={LINE_HANDLE_STROKE}
                  strokeWidth={2 / stageScale}
                />
              </Fragment>
            )}
          </Group>
        )
      }
      
      case 'text': {
        const text = shape as TextShape
        
        return (
          <Group
            x={text.x + text.width / 2}
            y={text.y + text.height / 2}
            rotation={shape.rotation || 0}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
            onDblClick={() => onDoubleClick?.(shape.id, shape)}
          >
            {/* Background rect (uses fill color) */}
            <Rect
              x={0}
              y={0}
              width={text.width}
              height={text.height}
              offsetX={text.width / 2}
              offsetY={text.height / 2}
              fill={text.color}
              opacity={shapeOpacity}
            />
            {/* Selection border */}
            {showBorder && (
              <Rect
                x={0}
                y={0}
                width={text.width}
                height={text.height}
                offsetX={text.width / 2}
                offsetY={text.height / 2}
                stroke={borderColor}
                strokeWidth={inverseBorderWidth}
                dash={[8 / stageScale, 4 / stageScale]} // Dashed pattern scales with zoom
                fill="transparent"
              />
            )}
            {/* Text content */}
            <KonvaText
              x={0}
              y={0}
              offsetX={text.width / 2}
              offsetY={text.height / 2}
              text={text.text}
              fontSize={text.fontSize}
              fontFamily={text.fontFamily}
              fill={text.textColor}
              width={text.width}
              height={text.height}
              align={text.align || 'left'}
              verticalAlign={text.verticalAlign || 'top'}
            />
          </Group>
        )
      }
      
      default:
        return null
    }
  }

  return (
    <Fragment key={shape.id}>
      {renderShape()}
      {/* Show dimension label for selected shape (but not for multi-select) */}
      {isSelected && isLockedByMe && !isManipulating && !isInMultiSelect && (
        <ShapeDimensionLabel 
          key={`${shape.id}-label`}
          shape={shape} 
          stageScale={stageScale} 
        />
      )}
    </Fragment>
  )
}

/**
 * Render a shape being created (newShape)
 */
export function NewShapeRenderer({
  shape,
}: {
  shape: Shape
}) {
  // Use shape's opacity or default to 0.5 for new shapes being drawn
  const newShapeOpacity = shape.opacity ?? 0.5
  
  const commonProps = {
    fill: NEW_SHAPE_COLOR,
    opacity: newShapeOpacity,
  }

  switch (shape.type) {
    case 'rectangle': {
      const rect = shape as RectangleShape
      return (
        <Rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          {...commonProps}
        />
      )
    }
    
    case 'circle': {
      const circle = shape as CircleShape
      // Ensure radii are always positive during creation
      const radiusX = Math.abs(circle.radiusX)
      const radiusY = Math.abs(circle.radiusY)
      return (
        <Ellipse
          x={circle.x + circle.radiusX}
          y={circle.y + circle.radiusY}
          radiusX={radiusX}
          radiusY={radiusY}
          {...commonProps}
        />
      )
    }
    
    case 'line': {
      const line = shape as LineShape
      return (
        <Line
          x={line.x}
          y={line.y}
          points={[0, 0, line.x2 - line.x, line.y2 - line.y]}
          stroke={NEW_SHAPE_COLOR}
          strokeWidth={2}
          opacity={newShapeOpacity}
        />
      )
    }
    
    case 'text': {
      const text = shape as TextShape
      
      return (
        <Group>
          {/* Background box */}
          <Rect
            x={text.x}
            y={text.y}
            width={text.width}
            height={text.height}
            fill={NEW_SHAPE_COLOR}
            opacity={newShapeOpacity}
          />
          {/* Text content */}
          <KonvaText
            x={text.x}
            y={text.y}
            text={text.text}
            fontSize={text.fontSize}
            fontFamily={text.fontFamily}
            fill={text.textColor}
            width={text.width}
            height={text.height}
            opacity={newShapeOpacity}
          />
        </Group>
      )
    }
    
    default:
      return null
  }
}
