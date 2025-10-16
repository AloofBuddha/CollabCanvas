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
  stageScale: number
  remoteUserColor?: string // Color of the remote user who locked this shape
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, shapeId: string, isLockedByOther: boolean, shape: Shape) => void
  onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>, shape: Shape, isSelected: boolean) => void
  onMouseLeave: () => void
  onDragStart: (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => void
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>, shape: Shape) => void
  onDragEnd: (shape: Shape) => void
}

const SHAPE_OPACITY = 0.8
const NEW_SHAPE_OPACITY = 0.5

export default function ShapeRenderer({
  shape,
  isSelected,
  isLockedByMe,
  isLockedByOther,
  isManipulating,
  isHoveringManipulationZone,
  stageScale,
  remoteUserColor,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ShapeRendererProps) {
  // Disable drag when hovering over manipulation zones (resize/rotate handles)
  // or when already manipulating
  const canDrag = !isLockedByOther && !isHoveringManipulationZone && !isManipulating
  const showBorder = (isSelected && isLockedByMe && !isManipulating) || isLockedByOther
  const borderColor = isLockedByMe ? SELECTION_COLOR_LOCAL : (remoteUserColor || SELECTION_COLOR_REMOTE_FALLBACK)

  const commonProps = {
    rotation: shape.rotation || 0,
    fill: shape.color,
    opacity: SHAPE_OPACITY,
    draggable: canDrag,
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape),
    onMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected),
    onMouseLeave,
    onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape),
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape),
    onDragEnd: () => onDragEnd(shape),
    stroke: showBorder ? borderColor : undefined,
    strokeWidth: showBorder ? 2 : 0,
  }

  const renderShape = () => {
    switch (shape.type) {
      case 'rectangle': {
        const rect = shape as RectangleShape
        return (
          <Rect
            x={rect.x + rect.width / 2}
            y={rect.y + rect.height / 2}
            width={rect.width}
            height={rect.height}
            offsetX={rect.width / 2}
            offsetY={rect.height / 2}
            {...commonProps}
          />
        )
      }
      
      case 'circle': {
        const circle = shape as CircleShape
        return (
          <Ellipse
            x={circle.x + circle.radiusX}
            y={circle.y + circle.radiusY}
            radiusX={circle.radiusX}
            radiusY={circle.radiusY}
            {...commonProps}
          />
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
                strokeWidth={line.strokeWidth + 4}
                opacity={0.5}
                listening={false}
              />
            )}
            {/* Actual line */}
            <Line
              points={points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              opacity={SHAPE_OPACITY}
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
          <KonvaText
            x={text.x}
            y={text.y}
            text={text.text}
            fontSize={text.fontSize}
            fontFamily={text.fontFamily}
            fill={text.textColor}
            width={text.width}
            opacity={SHAPE_OPACITY}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
            stroke={showBorder ? borderColor : undefined}
            strokeWidth={showBorder ? 2 : 0}
          />
        )
      }
      
      default:
        return null
    }
  }

  return (
    <Fragment key={shape.id}>
      {renderShape()}
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

/**
 * Render a shape being created (newShape)
 */
export function NewShapeRenderer({
  shape,
}: {
  shape: Shape
}) {
  const commonProps = {
    fill: NEW_SHAPE_COLOR,
    opacity: NEW_SHAPE_OPACITY,
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
      return (
        <Ellipse
          x={circle.x + circle.radiusX}
          y={circle.y + circle.radiusY}
          radiusX={circle.radiusX}
          radiusY={circle.radiusY}
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
          opacity={NEW_SHAPE_OPACITY}
        />
      )
    }
    
    case 'text': {
      const text = shape as TextShape
      return (
        <KonvaText
          x={text.x}
          y={text.y}
          text={text.text}
          fontSize={text.fontSize}
          fontFamily={text.fontFamily}
          fill={text.textColor}
          width={text.width}
          opacity={NEW_SHAPE_OPACITY}
        />
      )
    }
    
    default:
      return null
  }
}
