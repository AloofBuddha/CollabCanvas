import { useEffect, useState } from 'react'
import { auth } from './utils/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-canvas-bg overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            CollabCanvas MVP
          </h1>
          <p className="text-gray-600 mb-2">
            Real-time Collaborative Whiteboard
          </p>
          {user ? (
            <p className="text-sm text-green-600">
              Logged in as: {user.email}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Not logged in (Firebase configured)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

