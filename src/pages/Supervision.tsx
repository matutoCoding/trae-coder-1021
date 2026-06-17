import { useState } from 'react'
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  BarChart3,
  FileBarChart,
  TrendingUp,
  Package,
  AlertTriangle,
  Download,
  Calendar,
  ChevronRight,
  Database,
  Send,
  ShieldCheck
} from 'lucide-react'
import { useAppStore } from '@/store'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'

const reportStatus: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  '已上报': { label: '已上报', color: 'text-success', bg: 'bg-green-100', icon: CheckCircle },
  '上报中': { label: '上报中', color: 'text-primary-600', bg: 'bg-blue-100', icon: RefreshCw },
  '待上报': { label: '待上报', color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock },
  '上报失败': { label: '上报失败', color: 'text-danger', bg: 'bg-red-100', icon: XCircle },
}

const PIE_COLORS = ['#2d66a4', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4']

export default function Supervision() {
  const [activeTab, setActiveTab] = useState<'report' | 'stats'>('report')
  const supervisionReports = useAppStore((s) => s.supervisionReports)
  const warehousingOrders = useAppStore((s) => s.warehousingOrders)
  const outboundOrders = useAppStore((s) => s.outboundOrders)
  const hazardousGoods = useAppStore((s) => s.hazardousGoods)
  const updateSupervisionReport = useAppStore((s) => s.updateSupervisionReport)
  const batchUpdateSupervisionReports = useAppStore((s) => s.batchUpdateSupervisionReports)

  const pendingCount = supervisionReports.filter((r) => r.status === '待上报').length
  const failCount = supervisionReports.filter((r) => r.status === '上报失败').length

  const uploadReport = (id: string) => {
    updateSupervisionReport(id, { status: '上报中', fail_reason: '' })
    setTimeout(() => {
      const now = new Date()
      const receipt_no = 'RCP' + now.getTime()
      const receipt_time = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      updateSupervisionReport(id, {
        status: '已上报',
        receipt_no,
        receipt_time,
        fail_reason: '',
      })
    }, 2000)
  }

  const batchUploadReports = () => {
    const pendingReports = supervisionReports.filter(
      (r) => r.status === '待上报' || r.status === '上报失败'
    )
    if (pendingReports.length === 0) return
    const ids = pendingReports.map((r) => r.id)
    batchUpdateSupervisionReports(ids, { status: '上报中', fail_reason: '' })
    setTimeout(() => {
      const now = new Date()
      pendingReports.forEach((r, index) => {
        const reportTime = new Date(now.getTime() + index)
        updateSupervisionReport(r.id, {
          status: '已上报',
          receipt_no: 'RCP' + reportTime.getTime(),
          receipt_time: reportTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          fail_reason: '',
        })
      })
    }, 2000)
  }

  const monthlyData = [
    { month: '1月', 入库: 45, 出库: 38 },
    { month: '2月', 入库: 52, 出库: 41 },
    { month: '3月', 入库: 38, 出库: 45 },
    { month: '4月', 入库: 65, 出库: 58 },
    { month: '5月', 入库: 72, 出库: 65 },
    { month: '6月', 入库: 58, 出库: 52 },
  ]

  const hazardDistribution = hazardousGoods.reduce((acc, g) => {
    const existing = acc.find((x) => x.name === g.hazard_class)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: g.hazard_class, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const alertTrendData = [
    { date: '6/11', 警告: 3, 危险: 1 },
    { date: '6/12', 警告: 5, 危险: 0 },
    { date: '6/13', 警告: 2, 危险: 2 },
    { date: '6/14', 警告: 4, 危险: 1 },
    { date: '6/15', 警告: 6, 危险: 0 },
    { date: '6/16', 警告: 3, 危险: 1 },
    { date: '6/17', 警告: 4, 危险: 2 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">监管对接</h1>
        <p className="text-sm text-gray-500 mt-1">监管平台数据上报与合规统计分析</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">今日待上报</p>
              <p className="text-2xl font-bold text-warning mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">上报失败</p>
              <p className="text-2xl font-bold text-danger mt-1">{failCount}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-danger" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">本月成功上报</p>
              <p className="text-2xl font-bold text-success mt-1">
                {supervisionReports.filter((r) => r.status === '已上报').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">数据合规率</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">98.6%</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span className="font-semibold">一键上报监管平台</span>
            </div>
          </div>
          <p className="text-sm text-primary-100 mb-4">
            将待上报的所有数据（入库、出库、库存、安全）一键上报至危化品监管平台
          </p>
          <div className="space-y-2 mb-4">
            {supervisionReports
              .filter((r) => r.status === '待上报' || r.status === '上报失败')
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm bg-white/10 rounded px-3 py-2">
                  <span>{r.report_type}</span>
                  <span className="text-primary-200">{r.records_count}条</span>
                </div>
              ))}
          </div>
          <button
            onClick={batchUploadReports}
            disabled={pendingCount + failCount === 0}
            className="w-full py-2.5 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            立即上报 ({pendingCount + failCount}项)
          </button>
        </div>

        <div className="lg:col-span-2 card">
          <div className="border-b border-gray-100">
            <div className="flex">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'report'
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <FileBarChart className="w-4 h-4" />
                上报记录
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'stats'
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                统计报表
              </button>
            </div>
          </div>

          <div className="p-5">
            {activeTab === 'report' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="px-4 py-3 text-left">上报类型</th>
                      <th className="px-4 py-3 text-left">上报日期</th>
                      <th className="px-4 py-3 text-left">数据内容</th>
                      <th className="px-4 py-3 text-right">记录数</th>
                      <th className="px-4 py-3 text-left">状态</th>
                      <th className="px-4 py-3 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supervisionReports.map((report) => {
                      const config = reportStatus[report.status]
                      const Icon = config.icon
                      return (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="table-cell">
                            <span className="font-medium text-gray-800">{report.report_type}</span>
                          </td>
                          <td className="table-cell">
                            <div>
                              <span className="text-gray-700">{report.report_date}</span>
                              <span className="text-xs text-gray-400 ml-2">{report.report_time}</span>
                            </div>
                          </td>
                          <td className="table-cell text-gray-600">{report.content}</td>
                          <td className="table-cell text-right font-medium text-gray-800">{report.records_count}</td>
                          <td className="table-cell">
                            <span className={`badge inline-flex items-center gap-1 ${config.bg} ${config.color}`}>
                              <Icon className={`w-3 h-3 ${report.status === '上报中' ? 'animate-spin' : ''}`} />
                              {config.label}
                            </span>
                            {report.status === '已上报' && report.receipt_no && (
                              <div className="mt-1 text-xs text-gray-500">
                                <div>回执号: {report.receipt_no}</div>
                                <div>回执时间: {report.receipt_time}</div>
                              </div>
                            )}
                            {report.status === '上报失败' && report.fail_reason && (
                              <p className="text-xs text-danger mt-1">{report.fail_reason}</p>
                            )}
                          </td>
                          <td className="table-cell text-center">
                            <div className="flex items-center justify-center gap-2">
                              {(report.status === '待上报' || report.status === '上报失败') && (
                                <button
                                  onClick={() => uploadReport(report.id)}
                                  className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-0.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  {report.status === '上报失败' ? '重新上报' : '上报'}
                                </button>
                              )}
                              {report.status === '已上报' && (
                                <button className="text-gray-500 hover:text-gray-700 text-xs">查看回执</button>
                              )}
                              <button className="text-gray-500 hover:text-gray-700 text-xs">详情</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                      月度出入库统计
                    </h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <select className="input-field w-32 !py-1 text-xs">
                        <option>2026年</option>
                        <option>2025年</option>
                      </select>
                      <button className="btn-secondary text-xs !py-1 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> 导出
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }} />
                        <Legend />
                        <Bar dataKey="入库" fill="#2d66a4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="出库" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-primary-600" />
                      危化品分类占比
                    </h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={hazardDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {hazardDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      近7日告警趋势
                    </h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={alertTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="警告" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="危险" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">合规检查清单</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
            导出报告 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: '入库数据完整性', status: '合规', desc: `${warehousingOrders.length}笔入库记录全部登记`, value: '100%' },
            { title: '出库数据完整性', status: '合规', desc: `${outboundOrders.length}笔出库记录全部登记`, value: '100%' },
            { title: '消防设施检查', status: '待整改', desc: '1台报警器过检查期，1台异常', value: '87.5%' },
            { title: '人员资质有效性', status: '待整改', desc: '2人资质将在90天内到期', value: '66.7%' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 text-sm">{item.title}</span>
                <span className={`badge inline-flex items-center gap-1 ${
                  item.status === '合规' ? 'bg-green-100 text-success' : 'bg-amber-100 text-warning'
                }`}>
                  {item.status === '合规' ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{item.desc}</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.status === '合规' ? 'bg-success' : 'bg-warning'}`}
                  style={{ width: item.value }}
                />
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
