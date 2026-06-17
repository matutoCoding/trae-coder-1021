import { useState } from 'react'
import {
  AlertTriangle,
  Flame,
  Droplets,
  HeartPulse,
  Phone,
  MapPin,
  FileWarning,
  Package,
  Plus,
  X,
  Send,
  Clock,
  CheckCircle2,
  Users,
  HardHat,
  LifeBuoy,
  ChevronRight
} from 'lucide-react'
import { useAppStore } from '@/store'

const planTypes = [
  { key: 'leak', label: '泄漏处置', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'fire', label: '火灾应急', icon: Flame, color: 'text-red-600', bg: 'bg-red-100' },
  { key: 'poison', label: '中毒急救', icon: HeartPulse, color: 'text-purple-600', bg: 'bg-purple-100' },
]

const levelConfig: Record<string, { label: string; color: string; bg: string }> = {
  '一级': { label: 'Ⅰ级响应', color: 'text-danger', bg: 'bg-red-100' },
  '二级': { label: 'Ⅱ级响应', color: 'text-warning', bg: 'bg-amber-100' },
  '三级': { label: 'Ⅲ级响应', color: 'text-primary-600', bg: 'bg-blue-100' },
}

export default function Emergency() {
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedPlanType, setSelectedPlanType] = useState('leak')
  const emergencyPlans = useAppStore((s) => s.emergencyPlans)
  const emergencyResources = useAppStore((s) => s.emergencyResources)
  const accidentReports = useAppStore((s) => s.accidentReports)
  const addAccidentReport = useAppStore((s) => s.addAccidentReport)
  const currentUser = useAppStore((s) => s.currentUser)

  const [reportForm, setReportForm] = useState({
    accident_type: '泄漏' as const,
    level: '一般' as const,
    location: '',
    description: '',
    impact_scope: '',
    measures_taken: '',
    casualties: '无人员伤亡',
  })

  const handleSubmitReport = () => {
    if (!reportForm.location || !reportForm.description) return
    addAccidentReport({
      report_date: new Date().toISOString().split('T')[0],
      accident_type: reportForm.accident_type,
      level: reportForm.level,
      location: reportForm.location,
      description: reportForm.description,
      impact_scope: reportForm.impact_scope,
      measures_taken: reportForm.measures_taken,
      casualties: reportForm.casualties,
      reporter: currentUser.name,
      status: '待处理',
    })
    setShowReportForm(false)
    setReportForm({
      accident_type: '泄漏',
      level: '一般',
      location: '',
      description: '',
      impact_scope: '',
      measures_taken: '',
      casualties: '无人员伤亡',
    })
  }

  const currentPlan = emergencyPlans.find(
    (p) =>
      (selectedPlanType === 'leak' && p.type === '泄漏处置') ||
      (selectedPlanType === 'fire' && p.type === '火灾应急') ||
      (selectedPlanType === 'poison' && p.type === '中毒急救')
  )

  const resourceByType = emergencyResources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {} as Record<string, typeof emergencyResources>)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">应急处置</h1>
          <p className="text-sm text-gray-500 mt-1">应急预案管理、应急资源调度与事故上报</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="btn-danger flex items-center gap-1.5"
        >
          <FileWarning className="w-4 h-4" />
          事故上报
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '应急预案', value: emergencyPlans.length, icon: AlertTriangle, color: 'primary' },
          { label: '应急资源', value: emergencyResources.length, icon: Package, color: 'success' },
          { label: '事故记录', value: accidentReports.length, icon: FileWarning, color: 'danger' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === 'primary' ? 'bg-primary-100' : stat.color === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    stat.color === 'primary' ? 'text-primary-600' : stat.color === 'success' ? 'text-success' : 'text-danger'
                  }`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card p-5 bg-gradient-to-br from-red-50 to-amber-50 border border-red-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-danger rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg">紧急联系电话</h3>
            <p className="text-sm text-gray-500 mt-1">遇到紧急情况请立即拨打以下电话</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: '消防救援', phone: '119', desc: '火灾/爆炸' },
                { name: '医疗急救', phone: '120', desc: '人员中毒/受伤' },
                { name: '报警电话', phone: '110', desc: '治安事件' },
                { name: '应急指挥', phone: '021-****8888', desc: '内部应急' },
              ].map((contact, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-xs text-gray-500">{contact.name} <span className="text-gray-400">({contact.desc})</span></p>
                  <p className="text-xl font-bold text-danger mt-1">{contact.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">应急预案</h3>
        <div className="flex gap-2 mb-4">
          {planTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.key}
                onClick={() => setSelectedPlanType(type.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedPlanType === type.key
                    ? `${type.bg} ${type.color} border-current`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            )
          })}
        </div>

        {currentPlan && (
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  currentPlan.type === '泄漏处置' ? 'bg-blue-100' : currentPlan.type === '火灾应急' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {currentPlan.type === '泄漏处置' && <Droplets className="w-5 h-5 text-blue-600" />}
                  {currentPlan.type === '火灾应急' && <Flame className="w-5 h-5 text-red-600" />}
                  {currentPlan.type === '中毒急救' && <HeartPulse className="w-5 h-5 text-purple-600" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{currentPlan.title}</h4>
                  <span className={`badge ${levelConfig[currentPlan.level].bg} ${levelConfig[currentPlan.level].color}`}>
                    {levelConfig[currentPlan.level].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">处置步骤</h5>
                <div className="space-y-3">
                  {currentPlan.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3">应急联系人</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentPlan.contacts.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.position} · {c.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">应急物资库存</h3>
        <div className="space-y-4">
          {Object.entries(resourceByType).map(([type, items]) => {
            const icons: Record<string, any> = {
              '防护设备': HardHat,
              '检测设备': AlertTriangle,
              '灭火设备': Flame,
              '急救设备': LifeBuoy,
              '堵漏设备': Package,
            }
            const Icon = icons[type] || Package
            return (
              <div key={type} className="card">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-gray-800">{type}</span>
                    <span className="text-xs text-gray-500">({items.length}种)</span>
                  </div>
                  <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
                    查看全部 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.location}</p>
                        </div>
                        <span
                          className={`badge ${
                            item.status === '可用'
                              ? 'bg-green-100 text-success'
                              : item.status === '不足'
                              ? 'bg-red-100 text-danger'
                              : 'bg-amber-100 text-warning'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-end gap-1">
                        <span className="text-lg font-bold text-gray-800">{item.quantity}</span>
                        <span className="text-xs text-gray-500 mb-0.5">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4">事故记录</h3>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left">事故编号</th>
                <th className="px-4 py-3 text-left">日期</th>
                <th className="px-4 py-3 text-left">类型</th>
                <th className="px-4 py-3 text-left">级别</th>
                <th className="px-4 py-3 text-left">地点</th>
                <th className="px-4 py-3 text-left">简述</th>
                <th className="px-4 py-3 text-left">报告人</th>
                <th className="px-4 py-3 text-left">状态</th>
              </tr>
            </thead>
            <tbody>
              {accidentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs text-gray-700">{report.report_no}</td>
                  <td className="table-cell text-gray-600">{report.report_date}</td>
                  <td className="table-cell">
                    <span
                      className={`badge ${
                        report.accident_type === '火灾' || report.accident_type === '爆炸'
                          ? 'bg-red-100 text-danger'
                          : report.accident_type === '泄漏'
                          ? 'bg-blue-100 text-primary-600'
                          : report.accident_type === '中毒'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {report.accident_type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`badge ${
                        report.level === '特别重大' || report.level === '重大'
                          ? 'bg-red-100 text-danger'
                          : report.level === '较大'
                          ? 'bg-amber-100 text-warning'
                          : 'bg-blue-100 text-primary-600'
                      }`}
                    >
                      {report.level}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">{report.location}</td>
                  <td className="table-cell text-gray-600 max-w-xs truncate">{report.description}</td>
                  <td className="table-cell text-gray-600">{report.reporter}</td>
                  <td className="table-cell">
                    <span
                      className={`badge ${
                        report.status === '已完成'
                          ? 'bg-green-100 text-success'
                          : report.status === '处理中'
                          ? 'bg-blue-100 text-primary-600'
                          : 'bg-amber-100 text-warning'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-5 border-b border-gray-100 bg-red-50 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" />
                <h2 className="text-lg font-semibold text-gray-800">事故紧急上报</h2>
              </div>
              <button onClick={() => setShowReportForm(false)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">事故类型 <span className="text-danger">*</span></label>
                  <select
                    value={reportForm.accident_type}
                    onChange={(e) => setReportForm({ ...reportForm, accident_type: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="泄漏">泄漏</option>
                    <option value="火灾">火灾</option>
                    <option value="爆炸">爆炸</option>
                    <option value="中毒">中毒</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">事故级别 <span className="text-danger">*</span></label>
                  <select
                    value={reportForm.level}
                    onChange={(e) => setReportForm({ ...reportForm, level: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="一般">一般事故</option>
                    <option value="较大">较大事故</option>
                    <option value="重大">重大事故</option>
                    <option value="特别重大">特别重大事故</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">事故地点 <span className="text-danger">*</span></label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={reportForm.location}
                    onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                    className="input-field pl-9"
                    placeholder="如：1号仓库A-02库位"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">事故描述 <span className="text-danger">*</span></label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="请详细描述事故情况，包括泄漏量、火势大小等"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">影响范围</label>
                  <input
                    type="text"
                    value={reportForm.impact_scope}
                    onChange={(e) => setReportForm({ ...reportForm, impact_scope: e.target.value })}
                    className="input-field"
                    placeholder="如：B区局部"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">人员伤亡</label>
                  <input
                    type="text"
                    value={reportForm.casualties}
                    onChange={(e) => setReportForm({ ...reportForm, casualties: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">已采取措施</label>
                <textarea
                  value={reportForm.measures_taken}
                  onChange={(e) => setReportForm({ ...reportForm, measures_taken: e.target.value })}
                  className="input-field h-20 resize-none"
                  placeholder="如：已疏散人员、启动喷淋、关闭阀门等"
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowReportForm(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmitReport} className="btn-danger flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                立即上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
