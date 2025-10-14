/**
 * RemoteCursor Component
 * 
 * Displays a remote user's cursor position with their name
 */

import { MousePointer2 } from 'lucide-react'
import { RemoteCursor as RemoteCursorType } from '../types'

interface RemoteCursorProps {
  cursor: RemoteCursorType
}

export default function RemoteCursor({ cursor }: RemoteCursorProps) {
  return (
    <div
      className="absolute pointer-events-none transition-transform duration-75"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor Icon */}
      <div className="relative">
        <MousePointer2
          size={20}
          fill={cursor.color}
          color="white"
          strokeWidth={1.5}
        />
        
        {/* Name Label */}
        <div
          className="absolute top-5 left-3 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg"
          style={{ backgroundColor: cursor.color }}
        >
          {cursor.name}
        </div>
      </div>
    </div>
  )
}

