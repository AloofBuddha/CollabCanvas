/**
 * useAIAgent Hook
 * 
 * Manages AI Agent state and command execution
 */

import { useState } from 'react'
import { executeCommand } from '../services/aiAgent'
import { parseCommand } from '../services/commandParser'
import { CanvasContext } from '../types/aiAgent'
import { Shape } from '../types'

interface UseAIAgentProps {
  userId: string
  onShapesCreated: (shapes: Shape[]) => void
  onError: (message: string) => void
}

export function useAIAgent({ userId, onShapesCreated, onError }: UseAIAgentProps) {
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

      // Parse all commands into shapes
      const allShapes = commands.flatMap(cmd => parseCommand(cmd, userId))

      // Execute the action
      onShapesCreated(allShapes)

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

