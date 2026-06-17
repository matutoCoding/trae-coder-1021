import { useState } from 'react'
import { Plus, Search, Truck, User, MapPin, Check, Clock, X, FileText, QrCode, Phone } from 'lucide-react'
import { useAppStore } from '@/store'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待审批', color: 'text-gray-600', bg: 'bg-gray-100' },
  approved: { label: '已审批', color: 'text-primary-600', bg: 'bg-blue-100' },
  dispatched: { label: '配送中', color: 'text-warning', bg: 'bg-amber-100' },
  completed: { label: '已完成', color: 'text-success', bg: 'bg-green-100' },
}

export default function Outbound() {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const outboundOrders = useAppStore((s) => s.outboundOrders)
  const hazardousGoods = useAppStore((s) => s.hazardousGoods)
  const addOutboundOrder = useAppStore((s) => s.addOutboundOrder)

  const [formData, setFormData] = useState({
    goods_id: '',
    goods_name: '',
    quantity: 0,
    unit: 'L',
    receiver: '',
    purpose: '',
  })

  const filteredOrders = outboundOrders.filter((o) => activeTab === 'all' || o.status === activeTab)

  const handleSubmit = () => {
    if (!formData.receiver || !formData.goods_id) return
    const goods = hazardousGoods.find((g) => g.id === formData.goods_id)
    addOutboundOrder({
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
    })
    setShowForm(false)
    setFormData({ goods_id: '', goods_name: '', quantity: 0, unit: 'L', receiver: '', purpose: '' })
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
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn-primary">提交申请</button>
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
                        <button className="btn-primary text-xs px-3 py-1.5">审批通过</button>
                        <button className="btn-danger text-xs px-3 py-1.5">驳回</button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button className="btn-primary text-xs px-3 py-1.5">调度配送</button>
                    )}
                    {order.status === 'dispatched' && (
                      <button className="btn-primary text-xs px-3 py-1.5">确认送达</button>
                    )}
                    <button className="btn-secondary text-xs px-3 py-1.5">查看详情</button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {[
                    { label: '申请提交', done: true },
                    { label: '仓库审批', done: order.status !== 'pending' },
                    { label: '安全复核', done: order.status === 'approved' || order.status === 'dispatched' || order.status === 'completed' },
                    { label: '配送调度', done: order.status === 'dispatched' || order.status === 'completed' },
                    { label: '出库完成', done: order.status === 'completed' },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.done ? 'bg-success text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.done ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
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
