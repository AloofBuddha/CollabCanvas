import { useEffect, useRef } from 'react'
import Stats from 'stats.js'

interface FPSMonitorProps {
  visible: boolean
}

/**
 * FPS Monitor Component
 * 
 * Displays real-time performance stats using Stats.js:
 * - FPS (frames per second)
 * - MS (milliseconds per frame)
 * - MB (memory usage, if available)
 * 
 * Toggle visibility with Shift+F keyboard shortcut (handled by parent)
 */
export default function FPSMonitor({ visible }: FPSMonitorProps) {
  const statsRef = useRef<Stats | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize Stats.js
    const stats = new Stats()
    
    // Show all panels (FPS, MS, MB)
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb
    
    // Style the stats panel
    stats.dom.style.position = 'fixed'
    stats.dom.style.left = '10px'
    stats.dom.style.top = '80px' // Below header
    stats.dom.style.zIndex = '10000'
    
    statsRef.current = stats

    // Capture container ref value for cleanup
    const container = containerRef.current

    // Append to container
    if (container) {
      container.appendChild(stats.dom)
    }

    // Animation loop to update stats
    let animationFrameId: number

    function animate() {
      stats.begin()
      // Monitor the frame - stats.end() will be called by the main render loop
      stats.end()
      animationFrameId = requestAnimationFrame(animate)
    }

    if (visible) {
      animate()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      // Cleanup: remove stats DOM element using captured ref
      if (container && stats.dom.parentElement === container) {
        container.removeChild(stats.dom)
      }
    }
  }, [visible])

  // Hide/show stats panel based on visibility prop
  useEffect(() => {
    if (statsRef.current) {
      statsRef.current.dom.style.display = visible ? 'block' : 'none'
    }
  }, [visible])

  return <div ref={containerRef} />
}

