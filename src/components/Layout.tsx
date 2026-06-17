import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} currentPath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
