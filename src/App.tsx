import { useEffect } from 'react'
import { initAuthListener } from './utils/auth'
import useUserStore from './stores/useUserStore'
import AuthPage from './components/AuthPage'
import CanvasPage from './components/CanvasPage'
import LoadingSpinner from './components/LoadingSpinner'

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
    return <LoadingSpinner />
  }

  // Route protection: show AuthPage if not authenticated, CanvasPage if authenticated
  return authStatus === 'authenticated' ? <CanvasPage /> : <AuthPage />
}

export default App
