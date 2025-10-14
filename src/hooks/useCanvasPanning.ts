/**
 * useCanvasPanning Hook
 * 
 * Manages canvas panning state and document-level mouse listeners
 * for smooth panning even when cursor leaves the window
 */

import { useState, useEffect, RefObject } from 'react'
import Konva from 'konva'

interface UseCanvasPanningProps {
  stageRef: RefObject<Konva.Stage>
}

export function useCanvasPanning({ stageRef }: UseCanvasPanningProps) {
  const [isPanning, setIsPanning] = useState(false)

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
  }, [isPanning, stageRef])

  return {
    isPanning,
    setIsPanning,
  }
}

