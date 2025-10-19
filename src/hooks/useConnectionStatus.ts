import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { rtdb } from '../utils/firebase'

export type ConnectionStatus = 'online' | 'offline' | 'connecting'

export interface ConnectionState {
  status: ConnectionStatus
  isBrowserOnline: boolean
  isFirebaseConnected: boolean
}

/**
 * Hook to monitor connection status
 * 
 * Combines:
 * - Browser online/offline state (navigator.onLine + events)
 * - Firebase Realtime Database connection state (.info/connected)
 * 
 * Returns:
 * - 'online': Both browser and Firebase are connected
 * - 'offline': Browser is offline OR Firebase is disconnected
 * - 'connecting': Browser is online but Firebase is connecting
 */
export function useConnectionStatus(): ConnectionState {
  const [isBrowserOnline, setIsBrowserOnline] = useState(navigator.onLine)
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true) // Assume connected initially

  useEffect(() => {
    // Listen to browser online/offline events
    const handleOnline = () => setIsBrowserOnline(true)
    const handleOffline = () => setIsBrowserOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen to Firebase RTDB connection state
    // .info/connected is a special path that reflects connection status
    const connectedRef = ref(rtdb, '.info/connected')
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true
      setIsFirebaseConnected(connected)
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribe()
    }
  }, [])

  // Determine overall status
  let status: ConnectionStatus
  if (!isBrowserOnline) {
    status = 'offline'
  } else if (!isFirebaseConnected) {
    status = 'connecting'
  } else {
    status = 'online'
  }

  return {
    status,
    isBrowserOnline,
    isFirebaseConnected,
  }
}

