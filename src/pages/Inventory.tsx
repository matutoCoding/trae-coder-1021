import { useState, useMemo } from 'react'
import { Search, Filter, AlertTriangle, TrendingDown, TrendingUp, Package, ChevronRight, FileText, Download } from 'lucide-react'
import { useAppStore } from '@/store'

const hazardClasses = ['全部', '爆炸品', '压缩气体', '易燃液体', '易燃固体', '氧化性物质', '毒性物质', '腐蚀性物质']

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHazardClass, setSelectedHazardClass] = useState('全部')
  const hazardousGoods = useAppStore((s) => s.hazardousGoods)

  const stats = useMemo(() => {
    const total = hazardousGoods.reduce((sum, g) => sum + g.stock_quantity, 0)
    const warning = hazardousGoods.filter((g) => g.stock_quantity <= g.min_stock).length
    const danger = hazardousGoods.filter((g) => g.status === 'danger').length
    const overStock = hazardousGoods.filter((g) => g.stock_quantity >= g.max_stock * 0.9).length
    return { total, warning, danger, overStock, types: hazardousGoods.length }
  }, [hazardousGoods])

  const filteredGoods = useMemo(() => {
    return hazardousGoods.filter((g) => {
      const matchSearch =
        g.name.includes(searchTerm) ||
        g.cas_no.includes(searchTerm) ||
        g.un_no.includes(searchTerm) ||
        g.supplier.includes(searchTerm)
      const matchClass = selectedHazardClass === '全部' || g.hazard_class === selectedHazardClass
      return matchSearch && matchClass
    })
  }, [hazardousGoods, searchTerm, selectedHazardClass])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">货品台账</h1>
        <p className="text-sm text-gray-500 mt-1">危化品基础信息管理与库存预警</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">货品种类</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.types}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">总库存量</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">库存预警</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats.warning}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">高危货品</p>
              <p className="text-2xl font-bold text-danger mt-1">{stats.danger}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索危化品名称、CAS号、UN编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedHazardClass}
              onChange={(e) => setSelectedHazardClass(e.target.value)}
              className="input-field w-40"
            >
              {hazardClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">危化品名称</th>
                <th className="px-4 py-3 text-left">CAS号</th>
                <th className="px-4 py-3 text-left">UN编号</th>
                <th className="px-4 py-3 text-left">危险性分类</th>
                <th className="px-4 py-3 text-left">闪点</th>
                <th className="px-4 py-3 text-left">储存类别</th>
                <th className="px-4 py-3 text-right">库存数量</th>
                <th className="px-4 py-3 text-left">库存状态</th>
                <th className="px-4 py-3 text-left">供应商</th>
                <th className="px-4 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoods.map((goods) => {
                const stockPercent = (goods.stock_quantity / goods.max_stock) * 100
                const isLow = goods.stock_quantity <= goods.min_stock
                const isHigh = goods.stock_quantity >= goods.max_stock
                return (
                  <tr key={goods.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className="font-medium text-gray-800">{goods.name}</span>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-600">{goods.cas_no}</td>
                    <td className="table-cell font-mono text-xs text-gray-600">{goods.un_no}</td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          goods.hazard_class === '易燃液体' || goods.hazard_class === '爆炸品'
                            ? 'bg-red-100 text-danger'
                            : goods.hazard_class === '毒性物质' || goods.hazard_class === '腐蚀性物质'
                            ? 'bg-purple-100 text-purple-700'
                            : goods.hazard_class === '氧化性物质'
                            ? 'bg-yellow-100 text-warning'
                            : 'bg-blue-100 text-primary-600'
                        }`}
                      >
                        {goods.hazard_class}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">{goods.flash_point}</td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          goods.storage_category === '甲类'
                            ? 'bg-red-100 text-danger'
                            : goods.storage_category === '乙类'
                            ? 'bg-yellow-100 text-warning'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {goods.storage_category}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-800">
                          {goods.stock_quantity.toLocaleString()} {goods.unit}
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isLow ? 'bg-warning' : isHigh ? 'bg-danger' : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(stockPercent, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          {goods.min_stock} - {goods.max_stock} {goods.unit}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {goods.status === 'normal' && isLow ? (
                        <span className="badge bg-amber-100 text-warning">库存不足</span>
                      ) : goods.status === 'warning' ? (
                        <span className="badge bg-amber-100 text-warning">预警</span>
                      ) : goods.status === 'danger' ? (
                        <span className="badge bg-red-100 text-danger">高危</span>
                      ) : (
                        <span className="badge bg-green-100 text-success">正常</span>
                      )}
                    </td>
                    <td className="table-cell text-gray-600">{goods.supplier}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-0.5">
                          <FileText className="w-3.5 h-3.5" />
                          MSDS
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 text-xs flex items-center gap-0.5">
                          详情 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {filteredGoods.length} 条记录</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-500 hover:bg-gray-50">上一页</button>
            <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded">1</button>
            <button className="px-3 py-1.5 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  )
}
