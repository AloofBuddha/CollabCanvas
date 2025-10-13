/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validate password
 * Minimum 6 characters
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' }
  }

  return { isValid: true }
}

/**
 * Validate display name
 */
export const validateDisplayName = (displayName: string): ValidationResult => {
  if (!displayName) {
    return { isValid: false, error: 'Display name is required' }
  }

  if (displayName.length < 2) {
    return { isValid: false, error: 'Display name must be at least 2 characters' }
  }

  if (displayName.length > 50) {
    return { isValid: false, error: 'Display name must be less than 50 characters' }
  }

  return { isValid: true }
}

/**
 * Parse Firebase error messages to user-friendly text
 */
export const parseFirebaseError = (error: string): string => {
  if (error.includes('auth/email-already-in-use')) {
    return 'This email is already registered'
  }
  
  if (error.includes('auth/invalid-email')) {
    return 'Invalid email address'
  }
  
  if (error.includes('auth/weak-password')) {
    return 'Password is too weak'
  }
  
  if (error.includes('auth/user-not-found')) {
    return 'No account found with this email'
  }
  
  if (error.includes('auth/wrong-password')) {
    return 'Incorrect password'
  }
  
  if (error.includes('auth/invalid-credential')) {
    return 'Invalid email or password'
  }
  
  if (error.includes('auth/too-many-requests')) {
    return 'Too many failed attempts. Please try again later'
  }
  
  return error
}

