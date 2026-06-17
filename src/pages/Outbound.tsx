import { useState, useMemo } from 'react'
import { Plus, Search, Truck, User, MapPin, Check, Clock, X, FileText, QrCode, Phone, AlertTriangle, Layers } from 'lucide-react'
import { useAppStore } from '@/store'
import type { OutboundBatchAllocation } from '@/types'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待审批', color: 'text-gray-600', bg: 'bg-gray-100' },
  approved: { label: '已审批', color: 'text-primary-600', bg: 'bg-blue-100' },
  dispatched: { label: '配送中', color: 'text-warning', bg: 'bg-amber-100' },
  completed: { label: '已完成', color: 'text-success', bg: 'bg-green-100' },
  rejected: { label: '已驳回', color: 'text-danger', bg: 'bg-red-100' },
}

export default function Outbound() {
  const [showForm, setShowForm] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [dispatchData, setDispatchData] = useState({
    vehicle_no: '',
    driver: '',
    supervisor: '',
    route: '',
  })
  const outboundOrders = useAppStore((s) => s.outboundOrders)
  const hazardousGoods = useAppStore((s) => s.hazardousGoods)
  const addOutboundOrder = useAppStore((s) => s.addOutboundOrder)
  const updateOutboundOrder = useAppStore((s) => s.updateOutboundOrder)
  const processOutboundCompletion = useAppStore((s) => s.processOutboundCompletion)
  const checkStockAvailable = useAppStore((s) => s.checkStockAvailable)
  const currentUser = useAppStore((s) => s.currentUser)
  const getBatchesForGoods = useAppStore((s) => s.getBatchesForGoods)
  const getFIFOAllocationsForGoods = useAppStore((s) => s.getFIFOAllocationsForGoods)
  const batchInventory = useAppStore((s) => s.batchInventory)
  const storageLocations = useAppStore((s) => s.storageLocations)
  const warehouses = useAppStore((s) => s.warehouses)

  const [formData, setFormData] = useState({
    goods_id: '',
    goods_name: '',
    quantity: 0,
    unit: 'L',
    receiver: '',
    purpose: '',
  })
  const [batchMode, setBatchMode] = useState<'auto' | 'manual'>('auto')
  const [batchAllocations, setBatchAllocations] = useState<OutboundBatchAllocation[]>([])
  const [manualQuantities, setManualQuantities] = useState<Record<string, number>>({})

  const availableBatches = useMemo(() => {
    if (!formData.goods_id) return []
    return getBatchesForGoods(formData.goods_id)
  }, [formData.goods_id, getBatchesForGoods, batchInventory])

  const fifoAllocations = useMemo(() => {
    if (!formData.goods_id || formData.quantity <= 0) return []
    return getFIFOAllocationsForGoods(formData.goods_id, formData.quantity)
  }, [formData.goods_id, formData.quantity, getFIFOAllocationsForGoods, storageLocations])

  const manualAllocations = useMemo(() => {
    return availableBatches
      .map((b) => ({
        batch_no: b.batch_no,
        location_id: b.location_id,
        location_code: b.location_code,
        quantity: manualQuantities[b.batch_no] || 0,
      }))
      .filter((a) => a.quantity > 0)
  }, [availableBatches, manualQuantities])

  const manualTotal = manualAllocations.reduce((s, a) => s + a.quantity, 0)
  const manualValid = manualTotal === formData.quantity && formData.quantity > 0

  const filteredOrders = outboundOrders.filter((o) => activeTab === 'all' || o.status === activeTab)

  const handleSubmit = () => {
    if (!formData.receiver || !formData.goods_id) return
    if (batchMode === 'manual' && !manualValid) {
      alert('批次分配数量与出库数量不一致')
      return
    }
    const goods = hazardousGoods.find((g) => g.id === formData.goods_id)
    const allocations = batchMode === 'manual' ? manualAllocations : fifoAllocations
    const result = addOutboundOrder({
      order_no: `CK${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${(outboundOrders.length + 1).toString().padStart(3, '0')}`,
      out_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      goods_id: formData.goods_id,
      goods_name: goods?.name || formData.goods_name,
      quantity: formData.quantity,
      unit: formData.unit,
      receiver: formData.receiver,
      purpose: formData.purpose,
      vehicle_no: '',
      driver: '',
      supervisor: '',
      route: '',
      approver: '',
      approve_date: '',
      reject_reason: '',
      batch_allocations: allocations,
    })
    if (!result.success) {
      alert(result.message)
      return
    }
    alert('申请已提交')
    setShowForm(false)
    setFormData({ goods_id: '', goods_name: '', quantity: 0, unit: 'L', receiver: '', purpose: '' })
    setBatchMode('auto')
    setBatchAllocations([])
    setManualQuantities({})
  }

  const handleApprove = (id: string) => {
    updateOutboundOrder(id, {
      status: 'approved',
      approver: currentUser.name,
      approve_date: new Date().toISOString().split('T')[0],
    })
  }

  const handleReject = () => {
    if (!activeOrderId || !rejectReason.trim()) return
    updateOutboundOrder(activeOrderId, {
      status: 'rejected',
      reject_reason: rejectReason.trim(),
    })
    setShowRejectModal(false)
    setRejectReason('')
    setActiveOrderId(null)
  }

  const handleDispatch = () => {
    if (!activeOrderId) return
    updateOutboundOrder(activeOrderId, {
      status: 'dispatched',
      vehicle_no: dispatchData.vehicle_no,
      driver: dispatchData.driver,
      supervisor: dispatchData.supervisor,
      route: dispatchData.route,
    })
    setShowDispatchModal(false)
    setDispatchData({ vehicle_no: '', driver: '', supervisor: '', route: '' })
    setActiveOrderId(null)
  }

  const handleComplete = (order: { id: string; goods_id: string; quantity: number }) => {
    const stockCheck = checkStockAvailable(order.goods_id, order.quantity)
    if (!stockCheck.available) {
      alert(`库存不足，当前库存${stockCheck.currentStock}，需出库${stockCheck.required}`)
      return
    }
    const result = processOutboundCompletion(order.id)
    alert(result.message)
  }

  const openRejectModal = (id: string) => {
    setActiveOrderId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const openDispatchModal = (id: string) => {
    setActiveOrderId(id)
    setDispatchData({ vehicle_no: '', driver: '', supervisor: '', route: '' })
    setShowDispatchModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">出库配送</h1>
          <p className="text-sm text-gray-500 mt-1">出库申请审批与配送调度管理</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          新增出库申请
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '待审批', value: outboundOrders.filter((o) => o.status === 'pending').length, color: 'text-gray-600' },
          { label: '配送中', value: outboundOrders.filter((o) => o.status === 'dispatched').length, color: 'text-warning' },
          { label: '今日出库', value: outboundOrders.filter((o) => o.out_date === new Date().toISOString().split('T')[0]).length, color: 'text-primary-600' },
          { label: '本月总量', value: outboundOrders.filter((o) => o.out_date.startsWith('2026-06')).reduce((s, o) => s + o.quantity, 0).toLocaleString(), color: 'text-success' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">新增出库申请</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">危化品 <span className="text-danger">*</span></label>
                  <select
                    value={formData.goods_id}
                    onChange={(e) => {
                      const g = hazardousGoods.find((x) => x.id === e.target.value)
                      setFormData({ ...formData, goods_id: e.target.value, goods_name: g?.name || '', unit: g?.unit || 'L' })
                    }}
                    className="input-field"
                  >
                    <option value="">请选择危化品</option>
                    {hazardousGoods.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (库存: {g.stock_quantity} {g.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">收货方 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={formData.receiver}
                    onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                    className="input-field"
                    placeholder="请输入收货方名称"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">数量</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">单位</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="input-field">
                    <option value="L">L (升)</option>
                    <option value="kg">kg (千克)</option>
                    <option value="t">t (吨)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">用途</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="input-field"
                    placeholder="如生产原料"
                  />
                </div>
              </div>

              {formData.goods_id && formData.quantity > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-700">批次分配</span>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="batchMode"
                        checked={batchMode === 'auto'}
                        onChange={() => setBatchMode('auto')}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">自动分配（先进先出）</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="batchMode"
                        checked={batchMode === 'manual'}
                        onChange={() => setBatchMode('manual')}
                        className="accent-primary-600"
                      />
                      <span className="text-sm text-gray-700">手动指定批次</span>
                    </label>
                  </div>

                  {batchMode === 'auto' && (
                    <>
                      {fifoAllocations.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">批次号</th>
                                <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">库位</th>
                                <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">分配数量</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fifoAllocations.map((a, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                  <td className="px-3 py-2 font-mono text-xs">{a.batch_no}</td>
                                  <td className="px-3 py-2 text-xs">{a.location_code}</td>
                                  <td className="px-3 py-2 text-xs text-right font-medium">{a.quantity} {formData.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 bg-gray-50">
                                <td colSpan={2} className="px-3 py-2 text-xs font-medium text-gray-600">合计</td>
                                <td className="px-3 py-2 text-xs text-right font-bold text-primary-600">
                                  {fifoAllocations.reduce((s, a) => s + a.quantity, 0)} {formData.unit}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-red-500">可用批次库存不足，无法自动分配</p>
                      )}
                    </>
                  )}

                  {batchMode === 'manual' && (
                    <>
                      {availableBatches.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">批次号</th>
                                <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">库位</th>
                                <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">可用库存</th>
                                <th className="text-center px-3 py-2 text-xs text-gray-500 font-medium">分配数量</th>
                                <th className="text-right px-3 py-2 text-xs text-gray-500 font-medium">剩余</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableBatches.map((b) => (
                                <tr key={b.batch_no} className="border-t border-gray-100">
                                  <td className="px-3 py-2 font-mono text-xs">{b.batch_no}</td>
                                  <td className="px-3 py-2 text-xs">{b.location_code}</td>
                                  <td className="px-3 py-2 text-xs text-right">{b.remaining_quantity} {formData.unit}</td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number"
                                      min={0}
                                      max={b.remaining_quantity}
                                      value={manualQuantities[b.batch_no] || ''}
                                      onChange={(e) => {
                                        const val = Number(e.target.value)
                                        if (val < 0 || val > b.remaining_quantity) return
                                        setManualQuantities({ ...manualQuantities, [b.batch_no]: val })
                                      }}
                                      className="input-field text-center text-xs py-1 px-2 w-24"
                                      placeholder="0"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-xs text-right">
                                    {b.remaining_quantity - (manualQuantities[b.batch_no] || 0)} {formData.unit}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-200 bg-gray-50">
                                <td colSpan={3} className="px-3 py-2 text-xs font-medium text-gray-600">合计</td>
                                <td className="px-3 py-2 text-xs text-center font-bold text-primary-600">
                                  {manualTotal} {formData.unit}
                                </td>
                                <td />
                              </tr>
                            </tfoot>
                          </table>
                          {!manualValid && formData.quantity > 0 && (
                            <p className="text-xs text-red-500 mt-2">
                              {manualTotal > formData.quantity
                                ? `分配总量超出出库数量 ${manualTotal - formData.quantity} ${formData.unit}`
                                : `还需分配 ${formData.quantity - manualTotal} ${formData.unit}`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-red-500">该货品暂无可用批次</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn-primary">提交申请</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">驳回出库申请</h2>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setActiveOrderId(null) }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">驳回原因 <span className="text-danger">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="请输入驳回原因..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setActiveOrderId(null) }} className="btn-secondary">取消</button>
              <button onClick={handleReject} className="btn-danger" disabled={!rejectReason.trim()}>确认驳回</button>
            </div>
          </div>
        </div>
      )}

      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">调度配送</h2>
              <button onClick={() => { setShowDispatchModal(false); setDispatchData({ vehicle_no: '', driver: '', supervisor: '', route: '' }); setActiveOrderId(null) }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">车牌号</label>
                  <input
                    type="text"
                    value={dispatchData.vehicle_no}
                    onChange={(e) => setDispatchData({ ...dispatchData, vehicle_no: e.target.value })}
                    className="input-field"
                    placeholder="如 京A12345"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">司机</label>
                  <input
                    type="text"
                    value={dispatchData.driver}
                    onChange={(e) => setDispatchData({ ...dispatchData, driver: e.target.value })}
                    className="input-field"
                    placeholder="请输入司机姓名"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">押运员 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    value={dispatchData.supervisor}
                    onChange={(e) => setDispatchData({ ...dispatchData, supervisor: e.target.value })}
                    className="input-field"
                    placeholder="请输入押运员姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">配送路线 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    required
                    value={dispatchData.route}
                    onChange={(e) => setDispatchData({ ...dispatchData, route: e.target.value })}
                    className="input-field"
                    placeholder="如 仓库→A路段→收货方"
                  />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowDispatchModal(false); setDispatchData({ vehicle_no: '', driver: '', supervisor: '', route: '' }); setActiveOrderId(null) }} className="btn-secondary">取消</button>
              <button onClick={handleDispatch} className="btn-primary" disabled={!dispatchData.vehicle_no || !dispatchData.driver || !dispatchData.supervisor || !dispatchData.route}>确认调度</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: '全部' },
                { key: 'pending', label: '待审批' },
                { key: 'approved', label: '已审批' },
                { key: 'dispatched', label: '配送中' },
                { key: 'completed', label: '已完成' },
                { key: 'rejected', label: '已驳回' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="搜索单号、货品、收货方..." className="input-field pl-9" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status]
            return (
              <div key={order.id} className="p-5 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-gray-800">{order.order_no}</span>
                      <span className={`badge ${config.bg} ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-gray-400">{order.out_date}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> 货品信息
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{order.goods_name}</p>
                        <p className="text-xs text-gray-500">{order.quantity.toLocaleString()} {order.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> 收货方
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{order.receiver}</p>
                        <p className="text-xs text-gray-500">用途: {order.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" /> 配送信息
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{order.vehicle_no || '待调度'}</p>
                        <p className="text-xs text-gray-500">
                          {order.driver ? `司机: ${order.driver}` : '未分配'}
                          {order.supervisor && ` / 押运: ${order.supervisor}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> 配送路线
                        </p>
                        <p className="text-sm font-medium text-gray-800 mt-1">{order.route || '未规划'}</p>
                        {order.approver && <p className="text-xs text-gray-500">审批人: {order.approver}</p>}
                      </div>
                    </div>

                    {order.status === 'rejected' && order.reject_reason && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-danger" />
                          <span className="text-xs font-medium text-danger">驳回原因</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{order.reject_reason}</p>
                      </div>
                    )}

                    {order.status !== 'pending' && order.batch_allocations && order.batch_allocations.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">批次分配详情</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {order.batch_allocations.map((ba, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white rounded px-2.5 py-1.5 border border-gray-100">
                              <span className="font-mono text-xs text-gray-700">{ba.batch_no}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{ba.location_code}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs font-medium text-primary-600">{ba.quantity} {order.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(order.status === 'approved' || order.status === 'dispatched') && (
                      <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-primary-600" />
                            <span className="text-xs text-gray-600">出库码已生成</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary-600" />
                            <span className="text-xs text-gray-600">
                              {order.driver || '待分配司机'}
                              {order.supervisor && ` | ${order.supervisor}(押运)`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(order.id)} className="btn-primary text-xs px-3 py-1.5">审批通过</button>
                        <button onClick={() => openRejectModal(order.id)} className="btn-danger text-xs px-3 py-1.5">驳回</button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button onClick={() => openDispatchModal(order.id)} className="btn-primary text-xs px-3 py-1.5">调度配送</button>
                    )}
                    {order.status === 'dispatched' && (
                      <button onClick={() => handleComplete(order)} className="btn-primary text-xs px-3 py-1.5">确认送达</button>
                    )}
                    <button className="btn-secondary text-xs px-3 py-1.5">查看详情</button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {[
                    { label: '申请提交', done: order.status !== 'pending' || true },
                    { label: '仓库审批', done: order.status !== 'pending' },
                    { label: '安全复核', done: order.status === 'approved' || order.status === 'dispatched' || order.status === 'completed' },
                    { label: '配送调度', done: order.status === 'dispatched' || order.status === 'completed' },
                    { label: '出库完成', done: order.status === 'completed' },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.done ? (order.status === 'rejected' && i > 0 ? 'bg-red-400 text-white' : 'bg-success text-white') : 'bg-gray-200 text-gray-500'
                      }`}>
                        {order.status === 'rejected' && i > 0 && step.done ? <X className="w-3.5 h-3.5" /> : step.done ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs ${step.done ? (order.status === 'rejected' && i > 0 ? 'text-red-500' : 'text-gray-700') : 'text-gray-400'}`}>{step.label}</span>
                      {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${step.done ? (order.status === 'rejected' && i > 0 ? 'bg-red-400' : 'bg-success') : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
