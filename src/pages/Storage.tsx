import { useState } from 'react'
import { Thermometer, Droplets, Wind, Package, AlertTriangle, CheckCircle, Layers, Grid3x3 } from 'lucide-react'
import { useAppStore } from '@/store'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateTemperatureHistory } from '@/data/mockData'

const statusColor: Record<string, string> = {
  normal: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const statusLabel: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  danger: '报警',
}

export default function Storage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('1')
  const warehouses = useAppStore((s) => s.warehouses)
  const storageLocations = useAppStore((s) => s.storageLocations)

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouse)
  const currentLocations = storageLocations.filter((l) => l.warehouse_id === selectedWarehouse)
  const chartData = generateTemperatureHistory(currentWarehouse?.temperature || 22, 3)

  const usedPercent = currentWarehouse ? (currentWarehouse.used_capacity / currentWarehouse.capacity) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">库区储存</h1>
        <p className="text-sm text-gray-500 mt-1">分类分区储存可视化与环境监控</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {warehouses.map((wh) => (
          <button
            key={wh.id}
            onClick={() => setSelectedWarehouse(wh.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              selectedWarehouse === wh.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColor[wh.status]} ${wh.status !== 'normal' ? 'animate-blink' : ''}`} />
              {wh.name}
            </div>
          </button>
        ))}
      </div>

      {currentWarehouse && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">温度</span>
                </div>
                <span className={`badge ${currentWarehouse.temperature > currentWarehouse.temperature_threshold ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                  {currentWarehouse.temperature > currentWarehouse.temperature_threshold ? '超标' : '正常'}
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {currentWarehouse.temperature}<span className="text-lg font-normal text-gray-500 ml-1">℃</span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentWarehouse.temperature > currentWarehouse.temperature_threshold ? 'bg-danger' : 'bg-success'}`}
                  style={{ width: `${Math.min((currentWarehouse.temperature / 40) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">阈值: {currentWarehouse.temperature_threshold}℃</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">湿度</span>
                </div>
                <span className={`badge ${currentWarehouse.humidity > currentWarehouse.humidity_threshold ? 'bg-amber-100 text-warning' : 'bg-green-100 text-success'}`}>
                  {currentWarehouse.humidity > currentWarehouse.humidity_threshold ? '超标' : '正常'}
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {currentWarehouse.humidity}<span className="text-lg font-normal text-gray-500 ml-1">%</span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentWarehouse.humidity > currentWarehouse.humidity_threshold ? 'bg-warning' : 'bg-blue-500'}`}
                  style={{ width: `${currentWarehouse.humidity}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">阈值: {currentWarehouse.humidity_threshold}%</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">可燃气浓度</span>
                </div>
                <span className={`badge ${currentWarehouse.gas_concentration > currentWarehouse.gas_threshold ? 'bg-red-100 text-danger animate-blink' : 'bg-green-100 text-success'}`}>
                  {currentWarehouse.gas_concentration > currentWarehouse.gas_threshold ? '报警' : '正常'}
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-800">
                {currentWarehouse.gas_concentration}<span className="text-lg font-normal text-gray-500 ml-1">%LEL</span>
              </div>
              <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${currentWarehouse.gas_concentration > currentWarehouse.gas_threshold ? 'bg-danger animate-pulse' : 'bg-success'}`}
                  style={{ width: `${Math.min((currentWarehouse.gas_concentration / 0.5) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">阈值: {currentWarehouse.gas_threshold}%LEL</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-primary-600" />
                  库位可视化
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
                    空闲
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
                    使用中
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
                    接近满
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
                    已满
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center text-xs text-gray-500 mb-3">
                  —— 入口 ——
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-8 text-xs text-gray-400 text-right">第{row}排</span>
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {currentLocations
                          .filter((l) => l.row === row)
                          .sort((a, b) => a.col - b.col)
                          .map((loc) => {
                            const usagePercent = (loc.used_capacity / loc.capacity) * 100
                            const color =
                              loc.status === 'empty'
                                ? 'bg-green-100 border-green-300 hover:bg-green-200'
                                : usagePercent >= 90
                                ? 'bg-red-100 border-red-300 hover:bg-red-200'
                                : usagePercent >= 70
                                ? 'bg-amber-100 border-amber-300 hover:bg-amber-200'
                                : 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                            return (
                              <div
                                key={loc.id}
                                className={`relative aspect-square rounded border-2 ${color} flex flex-col items-center justify-center cursor-pointer transition-colors group`}
                              >
                                <span className="text-[10px] font-medium text-gray-700">{loc.code}</span>
                                {loc.goods_name && (
                                  <span className="text-[9px] text-gray-600 mt-0.5 truncate w-full text-center px-1">{loc.goods_name}</span>
                                )}
                                {loc.used_capacity > 0 && (
                                  <span className="text-[9px] text-gray-500">{loc.used_capacity}/{loc.capacity}</span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b overflow-hidden">
                                  <div
                                    className={`h-full ${usagePercent >= 90 ? 'bg-danger' : usagePercent >= 70 ? 'bg-warning' : 'bg-primary-500'}`}
                                    style={{ width: `${usagePercent}%` }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                  <div className="text-white text-[10px] text-center">
                                    <div className="font-medium">{loc.code}</div>
                                    <div>{loc.goods_name || '空库位'}</div>
                                    <div>{loc.used_capacity}/{loc.capacity}</div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">库区容量</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-800">{currentWarehouse.used_capacity.toLocaleString()}</span>
                  <span className="text-sm text-gray-500"> / {currentWarehouse.capacity.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">{usedPercent.toFixed(1)}% 已使用</p>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-600" />
                  温湿度趋势（近3天）
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="温度"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="湿度"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">库区基本信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">库区名称</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{currentWarehouse.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">所属分区</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{currentWarehouse.zone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">储存危化类型</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{currentWarehouse.hazard_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">运行状态</p>
                <p className="text-sm mt-1 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${statusColor[currentWarehouse.status]} ${currentWarehouse.status !== 'normal' ? 'animate-blink' : ''}`} />
                  <span className="font-medium text-gray-800">{statusLabel[currentWarehouse.status]}</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
