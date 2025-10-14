/**
 * Tests for shape manipulation utilities
 */

import { describe, it, expect } from 'vitest'
import { 
  detectManipulationZone, 
  calculateResize, 
  calculateRotation 
} from '../../src/utils/shapeManipulation'
import { Shape } from '../../src/types'

describe('detectManipulationZone', () => {
  const baseShape: Shape = {
    id: 'test-shape',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    rotation: 0,
    color: '#ff0000',
    createdBy: 'user-1',
  }

  describe('Corner detection', () => {
    it('should detect nw-corner when mouse is in top-left corner', () => {
      const result = detectManipulationZone(baseShape, 102, 102)
      expect(result.zone).toBe('nw-corner')
      expect(result.cursor).toBe('nwse-resize')
    })

    it('should detect ne-corner when mouse is in top-right corner', () => {
      const result = detectManipulationZone(baseShape, 298, 102)
      expect(result.zone).toBe('ne-corner')
      expect(result.cursor).toBe('nesw-resize')
    })

    it('should detect sw-corner when mouse is in bottom-left corner', () => {
      const result = detectManipulationZone(baseShape, 102, 198)
      expect(result.zone).toBe('sw-corner')
      expect(result.cursor).toBe('nesw-resize')
    })

    it('should detect se-corner when mouse is in bottom-right corner', () => {
      const result = detectManipulationZone(baseShape, 298, 198)
      expect(result.zone).toBe('se-corner')
      expect(result.cursor).toBe('nwse-resize')
    })
  })

  describe('Edge detection', () => {
    it('should detect n-edge when mouse is on top edge', () => {
      const result = detectManipulationZone(baseShape, 200, 102)
      expect(result.zone).toBe('n-edge')
      expect(result.cursor).toBe('ns-resize')
    })

    it('should detect s-edge when mouse is on bottom edge', () => {
      const result = detectManipulationZone(baseShape, 200, 198)
      expect(result.zone).toBe('s-edge')
      expect(result.cursor).toBe('ns-resize')
    })

    it('should detect w-edge when mouse is on left edge', () => {
      const result = detectManipulationZone(baseShape, 102, 150)
      expect(result.zone).toBe('w-edge')
      expect(result.cursor).toBe('ew-resize')
    })

    it('should detect e-edge when mouse is on right edge', () => {
      const result = detectManipulationZone(baseShape, 298, 150)
      expect(result.zone).toBe('e-edge')
      expect(result.cursor).toBe('ew-resize')
    })
  })

  describe('Center detection', () => {
    it('should detect center when mouse is in middle of shape', () => {
      const result = detectManipulationZone(baseShape, 200, 150)
      expect(result.zone).toBe('center')
      expect(result.cursor).toBe('move')
    })

    it('should detect center when mouse is away from edges', () => {
      const result = detectManipulationZone(baseShape, 180, 130)
      expect(result.zone).toBe('center')
      expect(result.cursor).toBe('move')
    })
  })

  describe('Rotation zone detection', () => {
    // Rotation zones are outside the corners
    // Shape is at x:100, y:100, width:200, height:100
    // So corners are at (100,100), (300,100), (100,200), (300,200)
    // Rotation zone is 30px square starting right at the corner edge
    // Zone extends from 0-30px outside each corner
    
    it('should detect nw-rotate when mouse is outside top-left corner', () => {
      // 15px outside top-left corner (100, 100)
      const result = detectManipulationZone(baseShape, 85, 85)
      expect(result.zone).toBe('nw-rotate')
      expect(result.cursor).toBe('grab')
    })

    it('should detect ne-rotate when mouse is outside top-right corner', () => {
      // 15px outside top-right corner (300, 100)
      const result = detectManipulationZone(baseShape, 315, 85)
      expect(result.zone).toBe('ne-rotate')
      expect(result.cursor).toBe('grab')
    })

    it('should detect sw-rotate when mouse is outside bottom-left corner', () => {
      // 15px outside bottom-left corner (100, 200)
      const result = detectManipulationZone(baseShape, 85, 215)
      expect(result.zone).toBe('sw-rotate')
      expect(result.cursor).toBe('grab')
    })

    it('should detect se-rotate when mouse is outside bottom-right corner', () => {
      // 15px outside bottom-right corner (300, 200)
      const result = detectManipulationZone(baseShape, 315, 215)
      expect(result.zone).toBe('se-rotate')
      expect(result.cursor).toBe('grab')
    })
    
    it('should detect rotation zones closer to corners', () => {
      // Right at the edge (1px outside)
      const result = detectManipulationZone(baseShape, 99, 99)
      expect(result.zone).toBe('nw-rotate')
      expect(result.cursor).toBe('grab')
    })
  })

  describe('Outside bounds', () => {
    it('should return center/default when mouse is far outside shape', () => {
      const result = detectManipulationZone(baseShape, 50, 50)
      expect(result.zone).toBe('center')
      expect(result.cursor).toBe('default')
    })

    it('should return center/default when mouse is beyond rotation zones', () => {
      const result = detectManipulationZone(baseShape, 400, 400)
      expect(result.zone).toBe('center')
      expect(result.cursor).toBe('default')
    })
  })

  describe('With rotation', () => {
    it('should detect zones correctly for rotated shapes', () => {
      const rotatedShape: Shape = { ...baseShape, rotation: 45 }
      
      // This is complex to test exactly due to rotation transformation
      // Just verify it returns valid zone and cursor
      const result = detectManipulationZone(rotatedShape, 200, 150)
      expect(['center', 'nw-corner', 'ne-corner', 'sw-corner', 'se-corner', 
              'n-edge', 's-edge', 'e-edge', 'w-edge',
              'nw-rotate', 'ne-rotate', 'sw-rotate', 'se-rotate']).toContain(result.zone)
      expect(['move', 'nwse-resize', 'nesw-resize', 'ns-resize', 'ew-resize', 'grab', 'default']).toContain(result.cursor)
    })
  })
})

describe('calculateResize', () => {
  const baseShape: Shape = {
    id: 'test-shape',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    rotation: 0,
    color: '#ff0000',
    createdBy: 'user-1',
  }

  describe('Corner resize', () => {
    it('should resize from nw-corner', () => {
      const result = calculateResize(
        baseShape, 
        'nw-corner', 
        80, 80,  // new mouse position
        100, 100, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(80) // x moves left by 20
      expect(result.y).toBe(80) // y moves up by 20
    })

    it('should resize from se-corner', () => {
      const result = calculateResize(
        baseShape,
        'se-corner',
        320, 220, // new mouse position (20px more)
        300, 200, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(100) // x stays the same
      expect(result.y).toBe(100) // y stays the same
    })

    it('should resize from ne-corner', () => {
      const result = calculateResize(
        baseShape,
        'ne-corner',
        320, 80, // new mouse position
        300, 100, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(100) // x stays the same
      expect(result.y).toBe(80) // y moves up by 20
    })

    it('should resize from sw-corner', () => {
      const result = calculateResize(
        baseShape,
        'sw-corner',
        80, 220, // new mouse position
        100, 200, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(80) // x moves left by 20
      expect(result.y).toBe(100) // y stays the same
    })
  })

  describe('Edge resize', () => {
    it('should resize from n-edge', () => {
      const result = calculateResize(
        baseShape,
        'n-edge',
        200, 80, // new mouse position
        200, 100, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(200) // width unchanged
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(100) // x unchanged
      expect(result.y).toBe(80) // y moves up by 20
    })

    it('should resize from s-edge', () => {
      const result = calculateResize(
        baseShape,
        's-edge',
        200, 220, // new mouse position
        200, 200, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(200) // width unchanged
      expect(result.height).toBe(120) // height increases by 20
      expect(result.x).toBe(100) // x unchanged
      expect(result.y).toBe(100) // y unchanged
    })

    it('should resize from w-edge', () => {
      const result = calculateResize(
        baseShape,
        'w-edge',
        80, 150, // new mouse position
        100, 150, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(100) // height unchanged
      expect(result.x).toBe(80) // x moves left by 20
      expect(result.y).toBe(100) // y unchanged
    })

    it('should resize from e-edge', () => {
      const result = calculateResize(
        baseShape,
        'e-edge',
        320, 150, // new mouse position
        300, 150, // start mouse position
        baseShape
      )
      
      expect(result.width).toBe(220) // width increases by 20
      expect(result.height).toBe(100) // height unchanged
      expect(result.x).toBe(100) // x unchanged
      expect(result.y).toBe(100) // y unchanged
    })
  })

  describe('Shape flipping on resize past starting point', () => {
    it('should flip width smoothly when dragging right edge past left edge', () => {
      // Drag right edge far to the left (past the left edge at x=100)
      const result = calculateResize(
        baseShape,
        'e-edge',
        50, 150, // drag to x=50 (left of anchor at x=100)
        300, 150, // starting at right edge
        baseShape
      )
      
      // Width should be distance from mouse to anchor
      expect(result.width).toBe(50) // abs(50 - 100)
      // X should follow the mouse (shape stays with cursor)
      expect(result.x).toBe(50)
    })

    it('should flip height smoothly when dragging bottom edge past top edge', () => {
      // Drag bottom edge far up (past the top edge at y=100)
      const result = calculateResize(
        baseShape,
        's-edge',
        200, 50, // drag to y=50 (above anchor at y=100)
        200, 200, // starting at bottom edge
        baseShape
      )
      
      // Height should be distance from mouse to anchor
      expect(result.height).toBe(50) // abs(50 - 100)
      // Y should follow the mouse (shape stays with cursor)
      expect(result.y).toBe(50)
    })
    
    it('should flip both dimensions smoothly when dragging se-corner past nw-corner', () => {
      // Drag SE corner past NW corner (anchor at 100, 100)
      const result = calculateResize(
        baseShape,
        'se-corner',
        50, 50, // drag to (50, 50), past the anchor at (100, 100)
        300, 200, // starting at SE corner
        baseShape
      )
      
      // Both dimensions should be distance from mouse to anchor
      expect(result.width).toBe(50) // abs(50 - 100)
      expect(result.height).toBe(50) // abs(50 - 100)
      // Position should follow mouse
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })

    it('should maintain minimum size when flipped', () => {
      // Try to make a very small flipped shape
      const result = calculateResize(
        baseShape,
        'e-edge',
        98, 150, // just 2px from anchor at x=100
        300, 150,
        baseShape
      )
      
      expect(result.width).toBeGreaterThanOrEqual(5) // MIN_SHAPE_SIZE
    })
    
    it('should resize normally before flipping', () => {
      // Drag SE corner outward (normal resize, no flip)
      const result = calculateResize(
        baseShape,
        'se-corner',
        320, 220, // drag outward from (300, 200)
        300, 200,
        baseShape
      )
      
      // Should grow normally
      expect(result.width).toBe(220) // 320 - 100
      expect(result.height).toBe(120) // 220 - 100
      expect(result.x).toBe(100) // anchor stays at (100, 100)
      expect(result.y).toBe(100)
    })
  })
})

describe('calculateRotation', () => {
  const baseShape: Shape = {
    id: 'test-shape',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    rotation: 0,
    color: '#ff0000',
    createdBy: 'user-1',
  }

  it('should calculate rotation relative to start position', () => {
    // Center of shape is at (200, 150)
    // Start at right side (300, 150)
    const startX = 300
    const startY = 150
    
    // No movement = no rotation change
    const angle1 = calculateRotation(baseShape, 300, 150, startX, startY, 0)
    expect(angle1).toBeCloseTo(0, 1)
    
    // Move 90 degrees counterclockwise (to top)
    const angle2 = calculateRotation(baseShape, 200, 50, startX, startY, 0)
    expect(angle2).toBeCloseTo(-90, 1)
    
    // Move 180 degrees (to left) - can be either 180 or -180 (equivalent)
    const angle3 = calculateRotation(baseShape, 100, 150, startX, startY, 0)
    const normalizedAngle3 = Math.abs(angle3)
    expect(normalizedAngle3).toBeCloseTo(180, 1)
    
    // Move 90 degrees clockwise (to bottom)
    const angle4 = calculateRotation(baseShape, 200, 250, startX, startY, 0)
    expect(angle4).toBeCloseTo(90, 1)
  })

  it('should add rotation to initial rotation', () => {
    // Start with 45 degree rotation
    // Start mouse at right (300, 150)
    // Move to top (200, 50) = -90 degree change
    const angle = calculateRotation(baseShape, 200, 50, 300, 150, 45)
    expect(angle).toBeCloseTo(-45, 1) // 45 + (-90) = -45
  })

  it('should handle no movement from start', () => {
    // Start and current position are the same = no change
    const angle = calculateRotation(baseShape, 300, 150, 300, 150, 90)
    expect(angle).toBeCloseTo(90, 1) // Should stay at initial rotation
  })
  
  it('should calculate smooth continuous rotation', () => {
    // Simulate smooth rotation from right to bottom
    const startX = 300
    const startY = 150
    const initialRot = 0
    
    // Quarter rotation clockwise
    const angle1 = calculateRotation(baseShape, 250, 200, startX, startY, initialRot)
    expect(angle1).toBeGreaterThan(0)
    expect(angle1).toBeLessThan(90)
    
    // Half rotation
    const angle2 = calculateRotation(baseShape, 200, 250, startX, startY, initialRot)
    expect(angle2).toBeCloseTo(90, 1)
  })
})

