/**
 * AI Agent Types
 * 
 * Type definitions for the AI Canvas Agent feature
 */

import { z } from 'zod'

// ============================================================================
// Command Schemas (using Zod for validation)
// ============================================================================

/**
 * Schema for creating a shape
 */
export const CreateShapeCommandSchema = z.object({
  action: z.literal('createShape'),
  shape: z.object({
    type: z.enum(['circle', 'rectangle', 'text', 'line']),
    name: z.string().optional(), // Optional name for the shape (e.g., "my-circle", "title-text")
    x: z.number(),
    y: z.number(),
    // Common properties
    color: z.string().optional(), // Main fill/stroke color for shapes, background for text
    fill: z.string().optional(), // Alias for color (for backwards compatibility)
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    rotation: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(), // 0-1, fully opaque by default
    // Circle/Rectangle dimensions
    width: z.number().optional(),
    height: z.number().optional(),
    radiusX: z.number().optional(),
    radiusY: z.number().optional(),
    // Line endpoints
    x2: z.number().optional(),
    y2: z.number().optional(),
    // Text properties
    text: z.string().optional(),
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    textColor: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  })
})

/**
 * Schema for updating a shape
 */
export const UpdateShapeCommandSchema = z.object({
  action: z.literal('updateShape'),
  // Target shape identification (one of these must be provided)
  shapeId: z.string().optional(), // Specific shape ID
  shapeName: z.string().optional(), // Shape name (e.g., "rectangle-1")
  selector: z.object({ // Select by properties
    type: z.enum(['circle', 'rectangle', 'text', 'line']).optional(),
    color: z.string().optional(),
  }).optional(),
  useSelected: z.boolean().optional(), // Use currently selected shapes
  // Properties to update (all optional)
  updates: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    radiusX: z.number().optional(),
    radiusY: z.number().optional(),
    x2: z.number().optional(),
    y2: z.number().optional(),
    color: z.string().optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    rotation: z.number().optional(),
    opacity: z.number().min(0).max(1).optional(),
    text: z.string().optional(),
    fontSize: z.number().optional(),
    fontFamily: z.string().optional(),
    textColor: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
    verticalAlign: z.enum(['top', 'middle', 'bottom']).optional(),
  })
})

/**
 * Schema for deleting shapes
 */
export const DeleteShapeCommandSchema = z.object({
  action: z.literal('deleteShape'),
  // Target shape identification (same as updateShape)
  shapeId: z.string().optional(),
  shapeName: z.string().optional(),
  selector: z.object({
    type: z.enum(['circle', 'rectangle', 'text', 'line']).optional(),
    color: z.string().optional(),
  }).optional(),
  useSelected: z.boolean().optional(),
})

/**
 * Union of all command schemas
 */
export const CommandSchema = z.discriminatedUnion('action', [
  CreateShapeCommandSchema,
  UpdateShapeCommandSchema,
  DeleteShapeCommandSchema,
])

/**
 * Response can be a single command or an array of commands
 */
export const AICommandResponseSchema = z.union([
  CommandSchema,
  z.array(CommandSchema)
])

// ============================================================================
// TypeScript Types (inferred from Zod schemas)
// ============================================================================

export type CreateShapeCommand = z.infer<typeof CreateShapeCommandSchema>
export type UpdateShapeCommand = z.infer<typeof UpdateShapeCommandSchema>
export type DeleteShapeCommand = z.infer<typeof DeleteShapeCommandSchema>
export type Command = z.infer<typeof CommandSchema>
export type AICommandResponse = z.infer<typeof AICommandResponseSchema>

// ============================================================================
// AI Agent State
// ============================================================================

export interface AIAgentState {
  isOpen: boolean
  isExecuting: boolean
  currentCommand: string
  error: string | null
}

// ============================================================================
// Canvas Context (what we send to the AI)
// ============================================================================

export interface CanvasContext {
  shapes: Array<{
    id: string
    name?: string // Human-readable name for AI commands
    type: string
    x: number
    y: number
    color?: string
    width?: number
    height?: number
    radiusX?: number
    radiusY?: number
    text?: string
    x2?: number
    y2?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    rotation?: number
    opacity?: number
  }>
  canvasDimensions: {
    width: number
    height: number
  }
  viewport: {
    x: number
    y: number
    scale: number
  }
  selectedShapeIds: string[]
}

// ============================================================================
// API Response
// ============================================================================

// Removed - now using AICommandResponse from Zod schema above

