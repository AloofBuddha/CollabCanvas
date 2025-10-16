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
    x: z.number(),
    y: z.number(),
    // Common properties
    fill: z.string().optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    rotation: z.number().optional(),
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
 * Union of all command schemas
 */
export const CommandSchema = z.discriminatedUnion('action', [
  CreateShapeCommandSchema,
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

