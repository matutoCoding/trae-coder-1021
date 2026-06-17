import { useState } from 'react'
import {
  Wind,
  Thermometer,
  Droplets,
  Camera,
  FireExtinguisher,
  UserCheck,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Expand,
  Play,
  Clock,
  ShieldAlert,
  Calendar
} from 'lucide-react'
import { useAppStore } from '@/store'

const tabs = [
  { key: 'gas', label: '可燃气检测', icon: Wind },
  { key: 'env', label: '温湿度监控', icon: Thermometer },
  { key: 'video', label: '视频监控', icon: Camera },
  { key: 'fire', label: '消防设施', icon: FireExtinguisher },
  { key: 'personnel', label: '人员资质', icon: UserCheck },
]

export default function Safety() {
  const [activeTab, setActiveTab] = useState('gas')
  const gasSensors = useAppStore((s) => s.gasSensors)
  const warehouses = useAppStore((s) => s.warehouses)
  const cameras = useAppStore((s) => s.cameras)
  const safetyDevices = useAppStore((s) => s.safetyDevices)
  const personnel = useAppStore((s) => s.personnel)

  const alarmCount = gasSensors.filter((s) => s.status === '报警').length
  const warningCount = gasSensors.filter((s) => s.status === '预警').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">安全监控</h1>
        <p className="text-sm text-gray-500 mt-1">环境监测、视频监控与安全设施管理</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">监测点位</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{gasSensors.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wind className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">报警点位</p>
              <p className="text-2xl font-bold text-danger mt-1 flex items-center gap-1">
                {alarmCount}
                {alarmCount > 0 && <span className="w-2 h-2 bg-danger rounded-full animate-blink" />}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">预警点位</p>
              <p className="text-2xl font-bold text-warning mt-1">{warningCount}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">在线摄像头</p>
              <p className="text-2xl font-bold text-success mt-1">
                {cameras.filter((c) => c.status === '在线').length}/{cameras.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'gas' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">可燃气浓度监测</h3>
                <button className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> 刷新数据
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gasSensors.map((sensor) => {
                  const percent = (sensor.concentration / sensor.threshold) * 100
                  return (
                    <div
                      key={sensor.id}
                      className={`p-4 rounded-lg border ${
                        sensor.status === '报警'
                          ? 'bg-red-50 border-red-200'
                          : sensor.status === '预警'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{sensor.location}</p>
                          <p className="text-xs text-gray-500">{sensor.gas_type} · {sensor.id}</p>
                        </div>
                        <span
                          className={`badge ${
                            sensor.status === '报警'
                              ? 'bg-red-100 text-danger animate-blink'
                              : sensor.status === '预警'
                              ? 'bg-amber-100 text-warning'
                              : 'bg-green-100 text-success'
                          }`}
                        >
                          {sensor.status}
                        </span>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className={`text-3xl font-bold ${
                          sensor.status === '报警' ? 'text-danger' : sensor.status === '预警' ? 'text-warning' : 'text-gray-800'
                        }`}>
                          {sensor.concentration}
                        </span>
                        <span className="text-sm text-gray-500 mb-1">{sensor.unit}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all ${
                            sensor.status === '报警' ? 'bg-danger animate-pulse' : sensor.status === '预警' ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(percent, 120)}%` }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: '100%' }} title={`阈值: ${sensor.threshold}${sensor.unit}`} />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0</span>
                        <span>阈值: {sensor.threshold}{sensor.unit}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        更新于 {sensor.last_update}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">各库区温湿度实时数据</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warehouses.map((wh) => (
                  <div key={wh.id} className="p-4 rounded-lg bg-white border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-800">{wh.name}</span>
                      <span
                        className={`badge ${
                          wh.status === 'danger'
                            ? 'bg-red-100 text-danger'
                            : wh.status === 'warning'
                            ? 'bg-amber-100 text-warning'
                            : 'bg-green-100 text-success'
                        }`}
                      >
                        {wh.status === 'normal' ? '正常' : wh.status === 'warning' ? '预警' : '报警'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Thermometer className="w-3.5 h-3.5 text-red-500" />
                          温度
                        </div>
                        <div className="flex items-end gap-1">
                          <span className={`text-2xl font-bold ${wh.temperature > wh.temperature_threshold ? 'text-danger' : 'text-gray-800'}`}>
                            {wh.temperature}
                          </span>
                          <span className="text-sm text-gray-500 mb-0.5">℃</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${wh.temperature > wh.temperature_threshold ? 'bg-danger' : 'bg-red-400'}`}
                            style={{ width: `${Math.min((wh.temperature / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-1">
                          <Droplets className="w-3.5 h-3.5 text-blue-500" />
                          湿度
                        </div>
                        <div className="flex items-end gap-1">
                          <span className={`text-2xl font-bold ${wh.humidity > wh.humidity_threshold ? 'text-warning' : 'text-gray-800'}`}>
                            {wh.humidity}
                          </span>
                          <span className="text-sm text-gray-500 mb-0.5">%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${wh.humidity > wh.humidity_threshold ? 'bg-warning' : 'bg-blue-400'}`}
                            style={{ width: `${wh.humidity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">视频监控列表</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cameras.map((cam) => (
                  <div key={cam.id} className="rounded-lg border border-gray-100 overflow-hidden bg-gray-900">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                      <Camera className={`w-10 h-10 ${cam.status === '在线' ? 'text-gray-600' : 'text-gray-700'}`} />
                      {cam.status === '在线' && (
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-danger rounded-full animate-blink" />
                          <span className="text-xs text-white">LIVE</span>
                        </div>
                      )}
                      {cam.status === '离线' && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">设备离线</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <button className="p-1.5 bg-black/50 rounded text-white hover:bg-black/70 transition-colors">
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 bg-black/50 rounded text-white hover:bg-black/70 transition-colors">
                          <Expand className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{cam.name}</p>
                          <p className="text-xs text-gray-500">{cam.location}</p>
                        </div>
                        <span
                          className={`badge ${cam.status === '在线' ? 'bg-green-100 text-success' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {cam.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fire' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">消防设施检查记录</h3>
                <span className="text-xs text-gray-500">
                  <span className="text-danger font-medium">{safetyDevices.filter((d) => d.status === '过期' || d.status === '异常').length}</span> 台设备需要关注
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="px-4 py-3 text-left">设备类型</th>
                      <th className="px-4 py-3 text-left">型号</th>
                      <th className="px-4 py-3 text-left">安装位置</th>
                      <th className="px-4 py-3 text-left">上次检查</th>
                      <th className="px-4 py-3 text-left">下次检查</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safetyDevices.map((device) => {
                      const daysLeft = Math.ceil(
                        (new Date(device.next_check_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      )
                      return (
                        <tr key={device.id} className="hover:bg-gray-50">
                          <td className="table-cell font-medium text-gray-800">{device.type}</td>
                          <td className="table-cell text-gray-600 font-mono text-xs">{device.model}</td>
                          <td className="table-cell text-gray-600">{device.location}</td>
                          <td className="table-cell text-gray-600">{device.last_check_date}</td>
                          <td className="table-cell">
                            <div>
                              <span className={`${daysLeft < 30 ? 'text-danger' : daysLeft < 60 ? 'text-warning' : 'text-gray-700'}`}>
                                {device.next_check_date}
                              </span>
                              {daysLeft < 30 && (
                                <span className="ml-2 text-xs text-danger">({daysLeft}天后)</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span
                              className={`badge ${
                                device.status === '正常'
                                  ? 'bg-green-100 text-success'
                                  : device.status === '待检查'
                                  ? 'bg-blue-100 text-primary-600'
                                  : device.status === '异常'
                                  ? 'bg-amber-100 text-warning'
                                  : 'bg-red-100 text-danger'
                              }`}
                            >
                              {device.status}
                            </span>
                          </td>
                          <td className="table-cell text-center">
                            <button className="text-primary-600 hover:text-primary-700 text-xs">检查登记</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'personnel' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">作业人员资质管理</h3>
                <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 培训记录
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {personnel.map((p) => {
                  const daysLeft = Math.ceil(
                    (new Date(p.certificate_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  const isExpiring = daysLeft < 90
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-lg border ${isExpiring ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${isExpiring ? 'bg-amber-100' : 'bg-primary-100'}`}>
                          <UserCheck className={`w-5 h-5 ${isExpiring ? 'text-warning' : 'text-primary-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">{p.name}</span>
                            <span
                              className={`badge ${
                                p.status === '在岗'
                                  ? 'bg-green-100 text-success'
                                  : p.status === '资质到期'
                                  ? 'bg-red-100 text-danger'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{p.position} · {p.department}</p>
                          <p className="text-xs text-gray-400 mt-1">{p.phone}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">证书类型</span>
                          <span className="text-gray-700">{p.certificate_type}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">证书编号</span>
                          <span className="text-gray-700 font-mono">{p.certificate_no}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">有效期至</span>
                          <span className={`${isExpiring ? 'text-danger font-medium' : 'text-gray-700'}`}>
                            {p.certificate_expiry}
                            {isExpiring && ` (${daysLeft}天后)`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">最近培训</span>
                          <span className="text-gray-700">{p.training_date}</span>
                        </div>
                      </div>
                      {isExpiring && (
                        <div className="mt-3 p-2 bg-amber-100 rounded flex items-center gap-1.5 text-xs text-warning">
                          <AlertCircle className="w-3.5 h-3.5" />
                          资质即将到期，请及时复审
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
