/**
 * TextEditor Component
 * 
 * HTML textarea overlay for editing text shape content.
 * Positioned absolutely at the canvas text position.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Konva from 'konva'
import { TextShape } from '../types'

interface TextEditorProps {
  shape: TextShape
  stageScale: number
  stageX: number
  stageY: number
  stageRef: Konva.Stage
  onTextChange: (text: string) => void
  onExitEdit: () => void
}

export default function TextEditor({
  shape,
  stageScale,
  stageX,
  stageY,
  stageRef,
  onTextChange,
  onExitEdit,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(shape.text)

  const handleSaveAndExit = useCallback(() => {
    onTextChange(text)
    onExitEdit()
  }, [text, onTextChange, onExitEdit])

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  // Handle Escape key to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleSaveAndExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSaveAndExit])

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        handleSaveAndExit()
      }
    }

    // Small delay to prevent immediate exit when entering edit mode
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleSaveAndExit])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  // Calculate screen position using Stage's actual position
  const stageContainer = stageRef.container()
  const containerRect = stageContainer.getBoundingClientRect()
  
  // Transform shape coordinates to screen coordinates
  const screenX = containerRect.left + (shape.x * stageScale) + stageX
  const screenY = containerRect.top + (shape.y * stageScale) + stageY
  const width = shape.width * stageScale
  const height = shape.height * stageScale

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleChange}
      className="fixed z-50 px-2 py-1 border-2 border-blue-500 rounded resize-none"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${shape.fontSize * stageScale}px`,
        fontFamily: shape.fontFamily,
        color: shape.textColor,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        lineHeight: '1.2',
        overflow: 'auto',
        pointerEvents: 'auto',
      }}
    />
  )
}

