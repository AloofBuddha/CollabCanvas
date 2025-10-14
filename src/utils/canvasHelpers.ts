/**
 * Canvas Helper Functions
 *
 * Pure utility functions for canvas behavior that are easily testable.
 */

export type OperationType =
  | 'panning'
  | 'drawing'
  | 'manipulating'  // resize or rotate
  | 'dragging'
  | 'just-finished'

/**
 * Determines if deselection should be prevented based on current operation state.
 * Used to maintain selection after drag/resize/rotate operations complete.
 *
 * @param currentOperation - The currently active operation, or null if idle
 * @returns true if deselection should be prevented
 */
export function shouldPreventDeselection(currentOperation: OperationType | null): boolean {
  // Prevent deselection if currently in any operation
  if (currentOperation !== null) {
    return true
  }

  return false
}

