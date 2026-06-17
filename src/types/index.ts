export interface HazardousGoods {
  id: string
  name: string
  cas_no: string
  un_no: string
  hazard_class: string
  flash_point: string
  storage_category: string
  stock_quantity: number
  max_stock: number
  min_stock: number
  unit: string
  msds_url: string
  expiry_date: string
  supplier: string
  status: 'normal' | 'warning' | 'danger'
}

export interface WarehousingOrder {
  id: string
  order_no: string
  supplier: string
  in_date: string
  status: 'pending' | 'inspecting' | 'approved' | 'rejected' | 'completed'
  goods_id: string
  goods_name: string
  quantity: number
  unit: string
  batch_no: string
  inspector: string
  inspection_result: string
  inspection_date: string
  warehouse_id: string
  location_code: string
  remarks: string
}

export interface Warehouse {
  id: string
  name: string
  zone: string
  hazard_type: string
  temperature: number
  humidity: number
  gas_concentration: number
  temperature_threshold: number
  humidity_threshold: number
  gas_threshold: number
  status: 'normal' | 'warning' | 'danger'
  capacity: number
  used_capacity: number
}

export interface StorageLocation {
  id: string
  warehouse_id: string
  code: string
  row: number
  col: number
  goods_id: string
  goods_name: string
  capacity: number
  used_capacity: number
  status: 'empty' | 'partial' | 'full'
}

export interface OutboundOrder {
  id: string
  order_no: string
  out_date: string
  status: 'pending' | 'approved' | 'dispatched' | 'completed' | 'rejected'
  goods_id: string
  goods_name: string
  quantity: number
  unit: string
  receiver: string
  purpose: string
  vehicle_no: string
  driver: string
  supervisor: string
  route: string
  approver: string
  approve_date: string
  reject_reason: string
}

export interface SafetyDevice {
  id: string
  type: '灭火器' | '消火栓' | '喷淋系统' | '报警器' | '应急灯'
  location: string
  model: string
  last_check_date: string
  next_check_date: string
  status: '正常' | '待检查' | '异常' | '过期'
}

export interface Personnel {
  id: string
  name: string
  position: string
  department: string
  phone: string
  certificate_no: string
  certificate_type: string
  certificate_expiry: string
  training_date: string
  status: '在岗' | '离岗' | '资质到期'
}

export interface EmergencyPlan {
  id: string
  type: '泄漏处置' | '火灾应急' | '爆炸应急' | '中毒急救'
  title: string
  level: '一级' | '二级' | '三级'
  steps: string[]
  contacts: EmergencyContact[]
}

export interface EmergencyContact {
  name: string
  position: string
  phone: string
}

export interface EmergencyResource {
  id: string
  name: string
  type: '防护设备' | '检测设备' | '灭火设备' | '急救设备' | '堵漏设备'
  quantity: number
  unit: string
  location: string
  status: '可用' | '维修中' | '不足'
}

export interface AccidentReport {
  id: string
  report_no: string
  report_date: string
  accident_type: '泄漏' | '火灾' | '爆炸' | '中毒' | '其他'
  level: '一般' | '较大' | '重大' | '特别重大'
  location: string
  description: string
  impact_scope: string
  measures_taken: string
  casualties: string
  reporter: string
  status: '待处理' | '处理中' | '已完成'
}

export interface SupervisionReport {
  id: string
  report_type: '入库数据' | '出库数据' | '库存数据' | '安全数据' | '异常事件'
  report_date: string
  report_time: string
  status: '待上报' | '上报中' | '已上报' | '上报失败'
  content: string
  records_count: number
  fail_reason: string
  receipt_no: string
  receipt_time: string
}

export interface GasSensor {
  id: string
  location: string
  warehouse_id: string
  gas_type: string
  concentration: number
  threshold: number
  unit: string
  status: '正常' | '预警' | '报警'
  last_update: string
}

export interface Camera {
  id: string
  name: string
  location: string
  warehouse_id: string
  status: '在线' | '离线'
  ip: string
}

export interface AlertRecord {
  id: string
  type: '温度' | '湿度' | '可燃气' | '烟雾' | '库存' | '消防' | '人员'
  level: '提示' | '警告' | '危险'
  location: string
  message: string
  time: string
  status: '未处理' | '处理中' | '已处理'
  handler: string
}

export type HazardClassType = 
  | '爆炸品'
  | '压缩气体'
  | '易燃液体'
  | '易燃固体'
  | '氧化性物质'
  | '毒性物质'
  | '放射性物质'
  | '腐蚀性物质'
  | '其他危险品'
