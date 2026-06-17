import { useState } from 'react'
import { Plus, Search, Check, X, Clock, AlertCircle, ShieldAlert, FileCheck, User, MapPin } from 'lucide-react'
import { useAppStore } from '@/store'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待检验', color: 'text-gray-600', bg: 'bg-gray-100' },
  inspecting: { label: '检验中', color: 'text-primary-600', bg: 'bg-blue-100' },
  approved: { label: '已入库', color: 'text-success', bg: 'bg-green-100' },
  rejected: { label: '已拒收', color: 'text-danger', bg: 'bg-red-100' },
  completed: { label: '已完成', color: 'text-success', bg: 'bg-green-100' },
}

const tabItems = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待检验' },
  { key: 'inspecting', label: '检验中' },
  { key: 'approved', label: '已入库' },
  { key: 'rejected', label: '已拒收' },
]

interface ApproveFormData {
  inspector: string
  inspection_result: string
  warehouse_id: string
  location_code: string
}

interface RejectFormData {
  inspector: string
  reject_reason: string
}

const defaultApproveForm: ApproveFormData = {
  inspector: '张伟',
  inspection_result: '合格',
  warehouse_id: '',
  location_code: '',
}

const defaultRejectForm: RejectFormData = {
  inspector: '张伟',
  reject_reason: '',
}

export default function Warehousing() {
  const [activeTab, setActiveTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const warehousingOrders = useAppStore((s) => s.warehousingOrders)
  const hazardousGoods = useAppStore((s) => s.hazardousGoods)
  const warehouses = useAppStore((s) => s.warehouses)
  const addWarehousingOrder = useAppStore((s) => s.addWarehousingOrder)
  const updateWarehousingOrder = useAppStore((s) => s.updateWarehousingOrder)

  const [formData, setFormData] = useState({
    supplier: '',
    goods_id: '',
    goods_name: '',
    quantity: 0,
    unit: 'L',
    batch_no: '',
    remarks: '',
  })

  const [approveForm, setApproveForm] = useState<ApproveFormData>(defaultApproveForm)
  const [rejectForm, setRejectForm] = useState<RejectFormData>(defaultRejectForm)

  const filteredOrders = warehousingOrders.filter((o) => {
    const matchTab = activeTab === 'all' || o.status === activeTab
    const matchSearch = o.order_no.includes(searchTerm) || o.goods_name.includes(searchTerm) || o.supplier.includes(searchTerm)
    return matchTab && matchSearch
  })

  const pendingCount = warehousingOrders.filter((o) => o.status === 'pending').length

  const handleSubmit = () => {
    if (!formData.supplier || !formData.goods_id) return
    const goods = hazardousGoods.find((g) => g.id === formData.goods_id)
    addWarehousingOrder({
      order_no: `RK${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${(warehousingOrders.length + 1).toString().padStart(3, '0')}`,
      supplier: formData.supplier,
      in_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      goods_id: formData.goods_id,
      goods_name: goods?.name || formData.goods_name,
      quantity: formData.quantity,
      unit: formData.unit,
      batch_no: formData.batch_no,
      inspector: '',
      inspection_result: '',
      inspection_date: '',
      warehouse_id: '',
      location_code: '',
      remarks: formData.remarks,
    })
    setShowForm(false)
    setFormData({ supplier: '', goods_id: '', goods_name: '', quantity: 0, unit: 'L', batch_no: '', remarks: '' })
  }

  const handleStartInspection = (id: string) => {
    updateWarehousingOrder(id, { status: 'inspecting' })
  }

  const handleOpenApprove = (id: string) => {
    setActiveOrderId(id)
    setApproveForm({ ...defaultApproveForm })
    setShowApproveModal(true)
  }

  const handleOpenReject = (id: string) => {
    setActiveOrderId(id)
    setRejectForm({ ...defaultRejectForm })
    setShowRejectModal(true)
  }

  const handleApproveSubmit = () => {
    if (!activeOrderId || !approveForm.inspector || !approveForm.warehouse_id) return
    updateWarehousingOrder(activeOrderId, {
      status: 'approved',
      inspector: approveForm.inspector,
      inspection_result: approveForm.inspection_result,
      inspection_date: new Date().toISOString().split('T')[0],
      warehouse_id: approveForm.warehouse_id,
      location_code: approveForm.location_code,
    })
    setShowApproveModal(false)
    setActiveOrderId(null)
  }

  const handleRejectSubmit = () => {
    if (!activeOrderId || !rejectForm.inspector || !rejectForm.reject_reason) return
    const order = warehousingOrders.find((o) => o.id === activeOrderId)
    const existingRemarks = order?.remarks ? order.remarks + '；' : ''
    updateWarehousingOrder(activeOrderId, {
      status: 'rejected',
      inspector: rejectForm.inspector,
      inspection_result: '不合格',
      inspection_date: new Date().toISOString().split('T')[0],
      remarks: existingRemarks + '拒收原因：' + rejectForm.reject_reason,
    })
    setShowRejectModal(false)
    setActiveOrderId(null)
  }

  const checkTaboo = (goodsId: string) => {
    const goods = hazardousGoods.find((g) => g.id === goodsId)
    if (!goods) return null
    const taboos: Record<string, string[]> = {
      '氧化性物质': ['易燃液体', '易燃固体'],
      '腐蚀性物质': ['酸性腐蚀品', '碱性腐蚀品'],
    }
    if (goods.hazard_class === '爆炸品') return '⚠️ 爆炸品需专库存放，不得与其他物品同库'
    if (taboos[goods.hazard_class]) {
      return `⚠️ 禁忌物料检查：${goods.hazard_class}不得与${taboos[goods.hazard_class].join('、')}同库存放`
    }
    if (parseFloat(goods.flash_point) < 28) {
      return `⚠️ 闪点低于28℃的易燃液体，需存放在甲类专用仓库`
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">入库管理</h1>
          <p className="text-sm text-gray-500 mt-1">危化品入库验收登记与检验管理</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          新增入库单
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '今日入库单', value: warehousingOrders.filter((o) => o.in_date === new Date().toISOString().split('T')[0]).length, color: 'primary' },
          { label: '待检验', value: pendingCount, color: 'warning' },
          { label: '本月入库', value: warehousingOrders.filter((o) => o.in_date.startsWith('2026-06')).length, color: 'success' },
          { label: '累计数量', value: warehousingOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString(), color: 'primary' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color === 'warning' ? 'text-warning' : stat.color === 'success' ? 'text-success' : 'text-gray-800'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">新增入库登记</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">供应商 <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="input-field"
                    placeholder="请输入供应商名称"
                  />
                </div>
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
                      <option key={g.id} value={g.id}>{g.name} ({g.un_no})</option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.goods_id && checkTaboo(formData.goods_id) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning">{checkTaboo(formData.goods_id)}</p>
                </div>
              )}
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
                  <label className="block text-sm text-gray-600 mb-1">批次号</label>
                  <input
                    type="text"
                    value={formData.batch_no}
                    onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                    className="input-field"
                    placeholder="如 B2026061701"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">备注</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="input-field h-20 resize-none"
                  placeholder="特殊储存要求等备注信息"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn-primary">提交入库</button>
            </div>
          </div>
        </div>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">检验通过 - 入库确认</h2>
              <button onClick={() => { setShowApproveModal(false); setActiveOrderId(null) }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">检验员 <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={approveForm.inspector}
                  onChange={(e) => setApproveForm({ ...approveForm, inspector: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">检验结果 <span className="text-danger">*</span></label>
                <select
                  value={approveForm.inspection_result}
                  onChange={(e) => setApproveForm({ ...approveForm, inspection_result: e.target.value })}
                  className="input-field"
                >
                  <option value="合格">合格</option>
                  <option value="有条件合格">有条件合格</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">入库仓库 <span className="text-danger">*</span></label>
                <select
                  value={approveForm.warehouse_id}
                  onChange={(e) => setApproveForm({ ...approveForm, warehouse_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">请选择仓库</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.zone})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">库位编码</label>
                <input
                  type="text"
                  value={approveForm.location_code}
                  onChange={(e) => setApproveForm({ ...approveForm, location_code: e.target.value })}
                  className="input-field"
                  placeholder="如 A-01-03"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowApproveModal(false); setActiveOrderId(null) }} className="btn-secondary">取消</button>
              <button onClick={handleApproveSubmit} className="btn-primary">确认入库</button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">检验拒收</h2>
              <button onClick={() => { setShowRejectModal(false); setActiveOrderId(null) }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">检验员 <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={rejectForm.inspector}
                  onChange={(e) => setRejectForm({ ...rejectForm, inspector: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">拒收原因 <span className="text-danger">*</span></label>
                <textarea
                  value={rejectForm.reject_reason}
                  onChange={(e) => setRejectForm({ ...rejectForm, reject_reason: e.target.value })}
                  className="input-field h-28 resize-none"
                  placeholder="请详细说明拒收原因..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowRejectModal(false); setActiveOrderId(null) }} className="btn-secondary">取消</button>
              <button onClick={handleRejectSubmit} className="btn-danger">确认拒收</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-danger text-white text-xs rounded-full">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索单号、货品、供应商..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status]
            return (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-gray-800">{order.order_no}</span>
                      <span className={`badge ${config.bg} ${config.color}`}>{config.label}</span>
                      <span className="text-xs text-gray-400">{order.in_date}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <FileCheck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">货品:</span>
                        <span className="text-gray-800 font-medium">{order.goods_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-gray-500">数量:</span>
                        <span className="text-gray-800 font-medium">{order.quantity.toLocaleString()} {order.unit}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-gray-500">批次:</span>
                        <span className="font-mono text-gray-800">{order.batch_no}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">供应商:</span>
                        <span className="text-gray-800">{order.supplier}</span>
                      </div>
                    </div>
                    {(order.inspector || order.location_code) && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {order.inspector && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Check className="w-4 h-4 text-success" />
                            <span className="text-gray-500">检验员:</span>
                            <span className="text-gray-800">{order.inspector}</span>
                            <span className={order.inspection_result === '不合格' ? 'text-danger' : 'text-success'}>({order.inspection_result})</span>
                          </div>
                        )}
                        {order.location_code && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <MapPin className="w-4 h-4 text-primary-600" />
                            <span className="text-gray-500">库位:</span>
                            <span className="text-gray-800 font-mono">{order.location_code}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {order.remarks && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${order.status === 'rejected' ? 'text-danger' : 'text-warning'}`} />
                        <span className={`text-sm ${order.status === 'rejected' ? 'text-danger' : 'text-warning'}`}>{order.remarks}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => handleStartInspection(order.id)} className="btn-primary text-xs px-3 py-1.5">开始检验</button>
                        <button className="btn-secondary text-xs px-3 py-1.5">详情</button>
                      </>
                    )}
                    {order.status === 'inspecting' && (
                      <>
                        <button onClick={() => handleOpenApprove(order.id)} className="btn-primary text-xs px-3 py-1.5">检验通过</button>
                        <button onClick={() => handleOpenReject(order.id)} className="btn-danger text-xs px-3 py-1.5">检验拒收</button>
                      </>
                    )}
                    {(order.status === 'approved' || order.status === 'completed') && (
                      <button className="btn-secondary text-xs px-3 py-1.5">查看详情</button>
                    )}
                    {order.status === 'rejected' && (
                      <button className="btn-secondary text-xs px-3 py-1.5">查看原因</button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {[
                    { label: '创建入库单', done: true },
                    { label: '禁忌物料检查', done: true },
                    { label: '危化品检验', done: order.status !== 'pending' },
                    { label: '分配库区', done: order.status === 'approved' || order.status === 'completed' },
                    { label: '入库完成', done: order.status === 'completed' },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.done ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.done ? <Check className="w-3.5 h-3.5" /> : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className={`text-xs ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
                      {i < arr.length - 1 && <div className={`flex-1 h-0.5 ${step.done ? 'bg-success' : 'bg-gray-200'}`} />}
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
