import { NavLink } from 'react-router-dom'
import {
  ClipboardList,
  PackagePlus,
  Warehouse,
  Truck,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Anchor,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  currentPath: string
}

const menuItems = [
  { path: '/inventory', label: '货品台账', icon: ClipboardList },
  { path: '/warehousing', label: '入库管理', icon: PackagePlus },
  { path: '/storage', label: '库区储存', icon: Warehouse },
  { path: '/outbound', label: '出库配送', icon: Truck },
  { path: '/safety', label: '安全监控', icon: ShieldAlert },
  { path: '/emergency', label: '应急处置', icon: AlertTriangle },
  { path: '/supervision', label: '监管对接', icon: Building2 },
]

export default function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-56'
      } bg-primary-600 flex flex-col transition-all duration-300 shadow-lg`}
    >
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-4'} border-b border-primary-700`}>
        <Anchor className="w-8 h-8 text-white flex-shrink-0" />
        {!collapsed && (
          <div className="ml-3">
            <h1 className="text-white font-bold text-base leading-tight">港口危化品</h1>
            <p className="text-primary-200 text-xs">仓储管理系统</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${
                      collapsed ? 'justify-center px-2' : 'px-3'
                    } py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-700 text-white shadow-inner'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-primary-700">
          <div className="bg-primary-700 rounded-md p-3">
            <p className="text-xs text-primary-200">系统版本</p>
            <p className="text-sm text-white font-medium">v1.0.0</p>
          </div>
        </div>
      )}
    </aside>
  )
}
