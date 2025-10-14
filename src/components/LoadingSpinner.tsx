interface LoadingSpinnerProps {
  message?: string
}

/**
 * Loading Spinner Component
 * 
 * Displays a centered loading spinner with optional message
 * Used during authentication, presence initialization, and other async operations
 */
export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  )
}

