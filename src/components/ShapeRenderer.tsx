/**
 * ShapeRenderer - Unified shape rendering component
 * 
 * This component eliminates duplication by providing a single interface
 * for rendering all shape types with their specific Konva components.
 */

import { Fragment } from 'react'
import { Rect, Ellipse, Line, Text as KonvaText } from 'react-konva'
import Konva from 'konva'
import { Shape, RectangleShape, CircleShape, LineShape, TextShape } from '../types'
import ShapeDimensionLabel from './ShapeDimensionLabel'

interface ShapeRendererProps {
  shape: Shape
  isSelected: boolean
  isLockedByMe: boolean
  isLockedByOther: boolean
  isManipulating: boolean
  stageScale: number
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
  stageScale,
  onMouseDown,
  onMouseMove,
  onMouseLeave,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ShapeRendererProps) {
  const canDrag = !isLockedByOther
  const showBorder = isSelected && isLockedByMe && !isManipulating
  const borderColor = isLockedByMe ? '#3B82F6' : '#EF4444' // Blue for local, red for remote

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
        return (
          <Line
            x={0}
            y={0}
            points={[line.x, line.y, line.x2, line.y2]}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            opacity={SHAPE_OPACITY}
            draggable={canDrag}
            onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id, isLockedByOther, shape)}
            onMouseMove={(e: Konva.KonvaEventObject<MouseEvent>) => onMouseMove(e, shape, isSelected)}
            onMouseLeave={onMouseLeave}
            onDragStart={(e: Konva.KonvaEventObject<DragEvent>) => onDragStart(e, shape)}
            onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => onDragMove(e, shape)}
            onDragEnd={() => onDragEnd(shape)}
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
    fill: '#D1D5DB',
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
          x={0}
          y={0}
          points={[line.x, line.y, line.x2, line.y2]}
          stroke="#D1D5DB"
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
