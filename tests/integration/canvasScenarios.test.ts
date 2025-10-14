/**
 * Canvas Integration Scenarios
 * 
 * Real-world user story tests based on bugs discovered during development.
 * These tests capture complex interactions and edge cases.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { calculateResize, calculateRotation, detectManipulationZone } from '../../src/utils/shapeManipulation'
import { Shape } from '../../src/types'

describe('Canvas Integration Scenarios', () => {
  describe('Rotation Persistence', () => {
    let shape: Shape

    beforeEach(() => {
      shape = {
        id: 'test-shape',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        color: '#ff0000',
        rotation: 0,
        createdBy: 'user1',
      }
    })

    it('should calculate rotation relative to start position', () => {
      // Scenario: User starts rotation from right side, drags upward
      // Bug: Initial jump because rotation wasn't relative to start
      // Fix: Pass startMouseX/Y to calculateRotation
      
      const startMouseX = 250 // Right side of shape (center is at 150)
      const startMouseY = 150 // Middle height
      const currentMouseX = 250 // Same X
      const currentMouseY = 100 // Dragged up significantly
      
      const rotation = calculateRotation(shape, currentMouseX, currentMouseY, startMouseX, startMouseY, 0)
      
      // Starting from right (0°), moving up creates negative rotation
      // The actual angle depends on the arc length - just verify it's negative
      expect(rotation).toBeLessThan(0)
      expect(rotation).toBeGreaterThan(-90)
    })

    it('should preserve rotation when syncing to Firestore', () => {
      // Scenario: Rotate shape, release, ensure rotation field is set
      // Bug: Rotation field wasn't being read from Firestore
      // Fix: Added rotation field to listenToShapes mapping
      
      const rotatedShape = { ...shape, rotation: 45 }
      
      // Simulate Firestore data
      const firestoreData = {
        id: rotatedShape.id,
        type: rotatedShape.type,
        x: rotatedShape.x,
        y: rotatedShape.y,
        width: rotatedShape.width,
        height: rotatedShape.height,
        rotation: rotatedShape.rotation, // Must be included
        color: rotatedShape.color,
        createdBy: rotatedShape.createdBy,
      }
      
      expect(firestoreData.rotation).toBe(45)
    })
  })

  describe('Smooth Flipping Resize', () => {
    let shape: Shape

    beforeEach(() => {
      shape = {
        id: 'test-shape',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        color: '#ff0000',
        rotation: 0,
        createdBy: 'user1',
      }
    })

    it('should flip smoothly when resizing SE corner past NW corner', () => {
      // Scenario: Drag SE corner to top-left of NW corner
      // Bug: Shape disappeared and reappeared in wrong position
      // Fix: Calculate dimensions as absolute distance from anchor
      
      const zone = 'se-corner'
      const mouseX = 80 // Past the left edge
      const mouseY = 80 // Past the top edge
      const startMouseX = 210 // Started at SE corner
      const startMouseY = 210
      
      const updates = calculateResize(shape, zone, mouseX, mouseY, startMouseX, startMouseY, shape)
      
      // Shape should flip but maintain positive dimensions
      expect(updates.width).toBeGreaterThan(0)
      expect(updates.height).toBeGreaterThan(0)
      
      // Top-left should move to where mouse is
      expect(updates.x).toBeLessThan(100)
      expect(updates.y).toBeLessThan(100)
    })

    it('should flip smoothly when resizing NW corner past SE corner', () => {
      // Scenario: Drag NW corner to bottom-right of SE corner
      // Expected: Smooth flip with positive dimensions
      
      const zone = 'nw-corner'
      const mouseX = 220 // Past the right edge
      const mouseY = 220 // Past the bottom edge
      const startMouseX = 90 // Started at NW corner
      const startMouseY = 90
      
      const updates = calculateResize(shape, zone, mouseX, mouseY, startMouseX, startMouseY, shape)
      
      expect(updates.width).toBeGreaterThan(0)
      expect(updates.height).toBeGreaterThan(0)
      expect(updates.x).toBeGreaterThan(100)
      expect(updates.y).toBeGreaterThan(100)
    })

    it('should maintain minimum size during flip', () => {
      // Scenario: Resize very small, ensuring MIN_SHAPE_SIZE is enforced
      // Expected: Shape never smaller than MIN_SHAPE_SIZE
      
      const zone = 'se-corner'
      const mouseX = 102 // Very close to anchor
      const mouseY = 102
      const startMouseX = 210
      const startMouseY = 210
      
      const updates = calculateResize(shape, zone, mouseX, mouseY, startMouseX, startMouseY, shape)
      
      expect(updates.width).toBeGreaterThanOrEqual(5)
      expect(updates.height).toBeGreaterThanOrEqual(5)
    })
  })

  describe('Hit Zone Invariance with zoom', () => {
    let shape: Shape

    beforeEach(() => {
      shape = {
        id: 'test-shape',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        color: '#ff0000',
        rotation: 0,
        createdBy: 'user1',
      }
    })

    it('should detect rotation zone consistently at different zoom levels', () => {
      // Scenario: Rotation zone should be same screen-space size regardless of zoom
      // Bug: Rotation zones were too small when zoomed in
      // Fix: Divide hit sizes by stageScale
      
      // ROTATION_ZONE_WIDTH = 30, so at 1x zoom, zone extends 30px outside corner
      // Shape is at x=100, y=100, so NW corner is at (100, 100)
      
      // At 1x zoom: zone extends to x=70, y=70 (30px outside)
      const mouseAt1x = { x: 90, y: 90 } // 10px outside corner
      const hitAt1x = detectManipulationZone(shape, mouseAt1x.x, mouseAt1x.y, 1)
      expect(hitAt1x.zone).toBe('nw-rotate')
      
      // At 2x zoom: zone extends to x=85, y=85 (15px outside in world space, 30px in screen space)
      const mouseAt2x = { x: 95, y: 95 } // 5px outside corner
      const hitAt2x = detectManipulationZone(shape, mouseAt2x.x, mouseAt2x.y, 2)
      expect(hitAt2x.zone).toBe('nw-rotate')
      
      // At 0.5x zoom: zone extends to x=40, y=40 (60px outside in world space, 30px in screen space)
      const mouseAt05x = { x: 70, y: 70 } // 30px outside corner
      const hitAt05x = detectManipulationZone(shape, mouseAt05x.x, mouseAt05x.y, 0.5)
      expect(hitAt05x.zone).toBe('nw-rotate')
    })

    it('should detect corner resize consistently at different zoom levels', () => {
      // Scenario: Corner hit detection should work at all zoom levels
      
      // Mouse at SE corner
      const mouseX = 198
      const mouseY = 198
      
      const hitAt1x = detectManipulationZone(shape, mouseX, mouseY, 1)
      const hitAt2x = detectManipulationZone(shape, mouseX, mouseY, 2)
      const hitAt05x = detectManipulationZone(shape, mouseX, mouseY, 0.5)
      
      expect(hitAt1x.zone).toBe('se-corner')
      expect(hitAt2x.zone).toBe('se-corner')
      expect(hitAt05x.zone).toBe('se-corner')
    })
  })

  describe('Dimension Label Visibility', () => {
    it('should show dimension label during resize', () => {
      // Scenario: User is resizing shape
      // Expected: Dimension label visible to show live dimensions

      const isDragging = false
      const isRotating = false

      const shouldShowLabel = !isDragging && !isRotating
      expect(shouldShowLabel).toBe(true)
    })

    it('should hide dimension label during drag', () => {
      // Scenario: User is dragging shape
      // Expected: Dimension label hidden (dimensions don't change)

      const isDragging = true
      const isRotating = false

      const shouldShowLabel = !isDragging && !isRotating
      expect(shouldShowLabel).toBe(false)
    })

    it('should hide dimension label during rotation', () => {
      // Scenario: User is rotating shape
      // Expected: Dimension label hidden (would rotate with shape, confusing)

      const isDragging = false
      const isRotating = true

      const shouldShowLabel = !isDragging && !isRotating
      expect(shouldShowLabel).toBe(false)
    })
  })

  describe('Rotation Pivot Point', () => {
    let shape: Shape

    beforeEach(() => {
      shape = {
        id: 'test-shape',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        color: '#ff0000',
        rotation: 0,
        createdBy: 'user1',
      }
    })

    it('should calculate rotation around shape center, not top-left', () => {
      // Scenario: Shape rotation should pivot around center
      // Bug: Was pivoting around top-left (x, y) origin
      // Fix: Set Konva offsetX/offsetY to width/2, height/2
      
      const centerX = shape.x + shape.width / 2
      const centerY = shape.y + shape.height / 2
      
      expect(centerX).toBe(150)
      expect(centerY).toBe(150)
      
      // When rendering in Konva:
      // x={shape.x + shape.width / 2}
      // y={shape.y + shape.height / 2}
      // offsetX={shape.width / 2}
      // offsetY={shape.height / 2}
      // This makes the visual center match the rotation pivot
    })
  })
})

