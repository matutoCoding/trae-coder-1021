import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Thermometer, Droplets, Wind, Package, AlertTriangle, CheckCircle, Layers, Grid3x3, X, MapPin, Warehouse, Tag, Box, Activity } from 'lucide-react'
import { useAppStore } from '@/store'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { generateTemperatureHistory } from '@/data/mockData'
import type { StorageLocation, LocationBatch } from '@/types'

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

const locationStatusLabel: Record<string, string> = {
  empty: '空闲',
  partial: '使用中',
  full: '已满',
}

const locationStatusColor: Record<string, string> = {
  empty: 'bg-green-100 text-success',
  partial: 'bg-blue-100 text-primary-600',
  full: 'bg-red-100 text-danger',
}

export default function Storage() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('1')
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const warehouses = useAppStore((s) => s.warehouses)
  const storageLocations = useAppStore((s) => s.storageLocations)
  const getStorageLocationByCode = useAppStore((s) => s.getStorageLocationByCode)
  const location = useLocation()
  const navigate = useNavigate()

  const currentWarehouse = warehouses.find((w) => w.id === selectedWarehouse)
  const currentLocations = storageLocations.filter((l) => l.warehouse_id === selectedWarehouse)
  const chartData = generateTemperatureHistory(currentWarehouse?.temperature || 22, 3)

  const usedPercent = currentWarehouse ? (currentWarehouse.used_capacity / currentWarehouse.capacity) * 100 : 0

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const warehouseId = params.get('warehouse_id')
    const locationCode = params.get('location_code')

    if (warehouseId && locationCode) {
      setSelectedWarehouse(warehouseId)
      const loc = getStorageLocationByCode(warehouseId, locationCode)
      if (loc) {
        setSelectedLocation(loc)
        setShowLocationModal(true)
      }
    }
  }, [location.search, getStorageLocationByCode])

  const handleLocationClick = (loc: StorageLocation) => {
    setSelectedLocation(loc)
    setShowLocationModal(true)
  }

  const handleCloseModal = () => {
    setShowLocationModal(false)
    setSelectedLocation(null)
    navigate('/storage', { replace: true })
  }

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
                                onClick={() => handleLocationClick(loc)}
                                className={`relative aspect-square rounded border-2 ${color} flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all group`}
                              >
                                <span className="text-[10px] font-medium text-gray-700">{loc.code}</span>
                                {loc.batches.length > 1 && (
                                  <span className="text-[9px] text-gray-600 mt-0.5">{loc.batches.length}批次</span>
                                )}
                                {loc.batches.length === 1 && (
                                  <span className="text-[9px] text-gray-600 mt-0.5 truncate w-full text-center px-1">{loc.batches[0].goods_name}</span>
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
                                    <div>{loc.batches.length > 0 ? (loc.batches.length > 1 ? `${loc.batches.length}批次` : loc.batches[0].goods_name) : '空库位'}</div>
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

      {showLocationModal && selectedLocation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                库位详情
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Tag className="w-3.5 h-3.5" />
                    库位编码
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{selectedLocation.code}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Warehouse className="w-3.5 h-3.5" />
                    所属仓库
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {warehouses.find((w) => w.id === selectedLocation.warehouse_id)?.name}
                  </p>
                </div>
              </div>

              {selectedLocation.batches.length === 0 ? (
                <div className="py-12 text-center">
                  <Box className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">该库位暂无货品</p>
                  <p className="text-xs text-gray-400 mt-1">容量: {selectedLocation.capacity}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">批次号</th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">货品名称</th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">数量</th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">来源入库单</th>
                          <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">入库日期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLocation.batches.map((batch: LocationBatch) => (
                          <tr key={batch.batch_no} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 px-2 text-gray-700">{batch.batch_no}</td>
                            <td className="py-2 px-2 text-gray-700">{batch.goods_name}</td>
                            <td className="py-2 px-2 text-gray-700">{batch.quantity}</td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() => navigate(`/warehousing?order_id=${batch.warehousing_order_id}`)}
                                className="text-primary-600 hover:text-primary-700 hover:underline"
                              >
                                {batch.warehousing_order_no}
                              </button>
                            </td>
                            <td className="py-2 px-2 text-gray-700">{batch.in_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Activity className="w-3.5 h-3.5" />
                        当前数量/容量
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedLocation.used_capacity} / {selectedLocation.capacity}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (selectedLocation.used_capacity / selectedLocation.capacity) * 100 >= 90
                            ? 'bg-danger'
                            : (selectedLocation.used_capacity / selectedLocation.capacity) * 100 >= 70
                            ? 'bg-warning'
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${(selectedLocation.used_capacity / selectedLocation.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      使用比例: {((selectedLocation.used_capacity / selectedLocation.capacity) * 100).toFixed(1)}%
                    </p>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">状态</span>
                  <span className={`badge inline-flex items-center gap-1 ${locationStatusColor[selectedLocation.status]}`}>
                    {selectedLocation.status === 'empty' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : selectedLocation.status === 'full' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <Package className="w-3 h-3" />
                    )}
                    {locationStatusLabel[selectedLocation.status]}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
