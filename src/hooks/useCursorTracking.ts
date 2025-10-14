/**
 * useCursorTracking Hook
 * 
 * Tracks local cursor position on the canvas and syncs with remote cursors
 */

import { useCallback, useRef } from 'react'
import Konva from 'konva'
import useCursorStore from '../stores/useCursorStore'
import { throttle, CURSOR_THROTTLE_MS } from '../utils/throttle'
import { Cursor } from '../types'

interface UseCursorTrackingProps {
  onCursorMove?: (cursor: Cursor) => void
}

export function useCursorTracking({ onCursorMove }: UseCursorTrackingProps) {
  const { setLocalCursor } = useCursorStore()
  
  // Use ref to hold throttled function to avoid recreation
  const throttledUpdateRef = useRef<((cursor: Cursor) => void) | null>(null)
  
  if (!throttledUpdateRef.current) {
    throttledUpdateRef.current = throttle((cursor: Cursor) => {
      setLocalCursor(cursor)
      onCursorMove?.(cursor)
    }, CURSOR_THROTTLE_MS)
  }

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = stage.getRelativePointerPosition()
    if (!pos) return

    if (throttledUpdateRef.current) {
      throttledUpdateRef.current({ x: pos.x, y: pos.y })
    }
  }, [])

  return {
    handleMouseMove,
  }
}

