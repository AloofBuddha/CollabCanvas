import { useConnectionStatus } from '../hooks/useConnectionStatus'

/**
 * Connection Status Indicator
 * 
 * Displays a small badge showing the current connection state:
 * - Green: Online and connected
 * - Yellow: Connecting (browser online but Firebase disconnected)
 * - Red: Offline (browser offline)
 */
export default function ConnectionStatusIndicator() {
  const { status } = useConnectionStatus()

  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'Connected',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    },
    offline: {
      color: 'bg-red-500',
      text: 'Offline',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border border-gray-200`}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${config.text}`}
    >
      {/* Status dot with pulse animation for connecting */}
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${config.color}`}
        />
        {status === 'connecting' && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`}
          />
        )}
      </div>
      
      {/* Status text */}
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  )
}

