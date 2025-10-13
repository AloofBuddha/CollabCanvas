import { useEffect } from 'react'
import { initAuthListener } from './utils/auth'
import useUserStore from './stores/useUserStore'
import AuthPage from './components/AuthPage'
import CanvasPage from './components/CanvasPage'

function App() {
  const { authStatus } = useUserStore()

  useEffect(() => {
    // Initialize Firebase auth listener
    const unsubscribe = initAuthListener()
    
    // Cleanup on unmount
    return () => unsubscribe()
  }, [])

  // Show loading state while checking auth
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Route protection: show AuthPage if not authenticated, CanvasPage if authenticated
  return authStatus === 'authenticated' ? <CanvasPage /> : <AuthPage />
}

export default App
