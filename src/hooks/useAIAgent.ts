/**
 * useAIAgent Hook
 * 
 * Manages AI Agent state and command execution
 */

import { useState } from 'react'
import { executeCommand } from '../services/aiAgent'
import { parseCommand } from '../services/commandParser'
import { CanvasContext, UpdateShapeCommand, DeleteShapeCommand } from '../types/aiAgent'
import { Shape } from '../types'

interface UseAIAgentProps {
  userId: string
  onShapesCreated: (shapes: Shape[]) => void
  onShapesUpdated: (command: UpdateShapeCommand) => void
  onShapesDeleted: (command: DeleteShapeCommand) => void
  onError: (message: string) => void
}

export function useAIAgent({ userId, onShapesCreated, onShapesUpdated, onShapesDeleted, onError }: UseAIAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')

  /**
   * Execute a user command
   */
  const execute = async (command: string, context: CanvasContext) => {
    if (!command.trim()) {
      return
    }

    setIsExecuting(true)
    setCurrentCommand(command)

    try {
      // Send to AI service
      const response = await executeCommand(command, context)

      // Response can be a single command or an array of commands
      const commands = Array.isArray(response) ? response : [response]

      // Process each command based on its action type
      for (const cmd of commands) {
        switch (cmd.action) {
          case 'createShape': {
            // Parse and create shapes
            const shapes = parseCommand(cmd, userId)
            onShapesCreated(shapes)
            break
          }
          case 'updateShape': {
            // Update existing shapes
            onShapesUpdated(cmd)
            break
          }
          case 'deleteShape': {
            // Delete shapes
            onShapesDeleted(cmd)
            break
          }
          default: {
            const _exhaustiveCheck: never = cmd
            console.error('Unknown command action:', _exhaustiveCheck)
          }
        }
      }

      // Clear input on success
      setCurrentCommand('')
      
      // Note: We keep the panel open so user can issue more commands
      // User can close manually if desired
    } catch (error) {
      console.error('Command execution error:', error)
      onError(error instanceof Error ? error.message : 'Failed to execute command')
    } finally {
      setIsExecuting(false)
    }
  }

  /**
   * Toggle the AI agent panel
   */
  const toggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Clear any previous command when opening
      setCurrentCommand('')
    }
  }

  /**
   * Close the AI agent panel
   */
  const close = () => {
    setIsOpen(false)
    setCurrentCommand('')
  }

  return {
    isOpen,
    isExecuting,
    currentCommand,
    setCurrentCommand,
    execute,
    toggle,
    close,
  }
}

