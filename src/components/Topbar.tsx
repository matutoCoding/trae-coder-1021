import { Bell, User, Menu, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store'

interface TopbarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Topbar({ collapsed, onToggle }: TopbarProps) {
  const [showAlerts, setShowAlerts] = useState(false)
  const currentUser = useAppStore((s) => s.currentUser)
  const alertRecords = useAppStore((s) => s.alertRecords)
  const unhandledAlerts = alertRecords.filter((a) => a.status !== '已处理')

  const now = new Date()
  const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unhandledAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center animate-blink">
                {unhandledAlerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">告警通知</h3>
                <span className="text-xs text-gray-500">{unhandledAlerts.length} 条未处理</span>
              </div>
              <div className="divide-y divide-gray-50">
                {unhandledAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          alert.level === '危险'
                            ? 'text-danger'
                            : alert.level === '警告'
                            ? 'text-warning'
                            : 'text-primary-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge ${
                              alert.level === '危险'
                                ? 'bg-red-100 text-danger'
                                : alert.level === '警告'
                                ? 'bg-amber-100 text-warning'
                                : 'bg-blue-100 text-primary-600'
                            }`}
                          >
                            {alert.level}
                          </span>
                          <span className="text-xs text-gray-400">{alert.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">位置: {alert.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
