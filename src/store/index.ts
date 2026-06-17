import { create } from 'zustand'
import type {
  HazardousGoods,
  WarehousingOrder,
  Warehouse,
  StorageLocation,
  OutboundOrder,
  SafetyDevice,
  Personnel,
  EmergencyPlan,
  EmergencyResource,
  AccidentReport,
  SupervisionReport,
  GasSensor,
  Camera,
  AlertRecord,
} from '@/types'
import {
  mockHazardousGoods,
  mockWarehousingOrders,
  mockWarehouses,
  generateStorageLocations,
  mockOutboundOrders,
  mockSafetyDevices,
  mockPersonnel,
  mockEmergencyPlans,
  mockEmergencyResources,
  mockAccidentReports,
  mockSupervisionReports,
  mockGasSensors,
  mockCameras,
  mockAlertRecords,
} from '@/data/mockData'

const STORAGE_KEY = 'hazardous-warehouse-data'

interface PersistedData {
  hazardousGoods: HazardousGoods[]
  warehouses: Warehouse[]
  storageLocations: StorageLocation[]
  warehousingOrders: WarehousingOrder[]
  outboundOrders: OutboundOrder[]
  accidentReports: AccidentReport[]
  supervisionReports: SupervisionReport[]
}

function loadPersisted(): PersistedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function persistData(data: PersistedData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const saved = loadPersisted()

interface AppState {
  hazardousGoods: HazardousGoods[]
  warehousingOrders: WarehousingOrder[]
  warehouses: Warehouse[]
  storageLocations: StorageLocation[]
  outboundOrders: OutboundOrder[]
  safetyDevices: SafetyDevice[]
  personnel: Personnel[]
  emergencyPlans: EmergencyPlan[]
  emergencyResources: EmergencyResource[]
  accidentReports: AccidentReport[]
  supervisionReports: SupervisionReport[]
  gasSensors: GasSensor[]
  cameras: Camera[]
  alertRecords: AlertRecord[]
  currentUser: { name: string; role: string }
  addWarehousingOrder: (order: Omit<WarehousingOrder, 'id'>) => void
  updateWarehousingOrder: (id: string, data: Partial<WarehousingOrder>) => void
  processWarehousingApproval: (orderId: string, data: Partial<WarehousingOrder> & { warehouse_id: string; location_code: string; quantity: number; goods_id: string }) => void
  addOutboundOrder: (order: Omit<OutboundOrder, 'id'>) => { success: boolean; message: string }
  updateOutboundOrder: (id: string, data: Partial<OutboundOrder>) => void
  processOutboundCompletion: (orderId: string) => { success: boolean; message: string }
  checkStockAvailable: (goodsId: string, quantity: number) => { available: boolean; currentStock: number; required: number }
  handleAlert: (id: string, handler: string) => void
  addAccidentReport: (report: Omit<AccidentReport, 'id' | 'report_no'>) => void
  updateSupervisionReport: (id: string, data: Partial<SupervisionReport>) => void
  batchUpdateSupervisionReports: (ids: string[], data: Partial<SupervisionReport>) => void
  updateStorageLocation: (id: string, data: Partial<StorageLocation>) => void
  getStorageLocationByCode: (warehouseId: string, code: string) => StorageLocation | undefined
}

export const useAppStore = create<AppState>((set, get) => ({
  hazardousGoods: saved?.hazardousGoods || mockHazardousGoods,
  warehousingOrders: saved?.warehousingOrders || mockWarehousingOrders,
  warehouses: saved?.warehouses || mockWarehouses,
  storageLocations: saved?.storageLocations || generateStorageLocations(mockWarehouses),
  outboundOrders: saved?.outboundOrders || mockOutboundOrders,
  safetyDevices: mockSafetyDevices,
  personnel: mockPersonnel,
  emergencyPlans: mockEmergencyPlans,
  emergencyResources: mockEmergencyResources,
  accidentReports: saved?.accidentReports || mockAccidentReports,
  supervisionReports: saved?.supervisionReports || mockSupervisionReports,
  gasSensors: mockGasSensors,
  cameras: mockCameras,
  alertRecords: mockAlertRecords,
  currentUser: { name: '张伟', role: '仓库管理员' },

  addWarehousingOrder: (order) =>
    set((state) => {
      const newList = [{ ...order, id: Date.now().toString() }, ...state.warehousingOrders]
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: newList,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { warehousingOrders: newList }
    }),

  updateWarehousingOrder: (id, data) =>
    set((state) => {
      const newList = state.warehousingOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      )
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: newList,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { warehousingOrders: newList }
    }),

  processWarehousingApproval: (orderId, data) => {
    const { warehouse_id, location_code, quantity, goods_id, ...orderData } = data
    const state = get()
    const order = state.warehousingOrders.find(o => o.id === orderId)
    if (!order) return

    const newWarehousingOrders = state.warehousingOrders.map((o) =>
      o.id === orderId ? { ...o, ...orderData, warehouse_id, location_code } : o
    )

    const newHazardousGoods = state.hazardousGoods.map((g) =>
      g.id === goods_id ? { ...g, stock_quantity: g.stock_quantity + quantity } : g
    )

    const newWarehouses = state.warehouses.map((w) =>
      w.id === warehouse_id ? { ...w, used_capacity: w.used_capacity + quantity } : w
    )

    let newStorageLocations = state.storageLocations
    const existingLocation = newStorageLocations.find(
      (loc) => loc.warehouse_id === warehouse_id && loc.code === location_code
    )
    if (existingLocation) {
      newStorageLocations = newStorageLocations.map((loc) => {
        if (loc.id === existingLocation.id) {
          const newUsed = loc.used_capacity + quantity
          return {
            ...loc,
            goods_id,
            goods_name: order.goods_name,
            batch_no: order.batch_no,
            warehousing_order_id: order.id,
            warehousing_order_no: order.order_no,
            used_capacity: newUsed,
            status: newUsed === 0 ? 'empty' : newUsed >= loc.capacity * 0.9 ? 'full' : 'partial' as const,
          }
        }
        return loc
      })
    } else {
      const firstEmptyLoc = newStorageLocations.find(
        (loc) => loc.warehouse_id === warehouse_id && loc.status === 'empty'
      )
      if (firstEmptyLoc) {
        newStorageLocations = newStorageLocations.map((loc) => {
          if (loc.id === firstEmptyLoc.id) {
            return {
              ...loc,
              code: location_code,
              goods_id,
              goods_name: order.goods_name,
              batch_no: order.batch_no,
              warehousing_order_id: order.id,
              warehousing_order_no: order.order_no,
              used_capacity: quantity,
              status: quantity >= loc.capacity * 0.9 ? 'full' : 'partial' as const,
            }
          }
          return loc
        })
      }
    }

    persistData({
      hazardousGoods: newHazardousGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      warehousingOrders: newWarehousingOrders,
      outboundOrders: state.outboundOrders,
      accidentReports: state.accidentReports,
      supervisionReports: state.supervisionReports,
    })

    set({
      hazardousGoods: newHazardousGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      warehousingOrders: newWarehousingOrders,
    })
  },

  checkStockAvailable: (goodsId, quantity) => {
    const goods = get().hazardousGoods.find(g => g.id === goodsId)
    if (!goods) return { available: false, currentStock: 0, required: quantity }
    return {
      available: goods.stock_quantity >= quantity,
      currentStock: goods.stock_quantity,
      required: quantity,
    }
  },

  addOutboundOrder: (order) => {
    const check = get().checkStockAvailable(order.goods_id, order.quantity)
    if (!check.available) {
      return { success: false, message: `库存不足，当前库存${check.currentStock}${order.unit}，申请${check.required}${order.unit}` }
    }
    set((state) => {
      const newList = [{ ...order, id: Date.now().toString(), reject_reason: (order as any).reject_reason || '' }, ...state.outboundOrders]
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: newList,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { outboundOrders: newList }
    })
    return { success: true, message: '申请已提交' }
  },

  updateOutboundOrder: (id, data) =>
    set((state) => {
      const newList = state.outboundOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      )
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: newList,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { outboundOrders: newList }
    }),

  processOutboundCompletion: (orderId) => {
    const state = get()
    const order = state.outboundOrders.find(o => o.id === orderId)
    if (!order) return { success: false, message: '订单不存在' }

    const check = get().checkStockAvailable(order.goods_id, order.quantity)
    if (!check.available) {
      return { success: false, message: `库存不足，当前库存${check.currentStock}${order.unit}，需出库${check.required}${order.unit}` }
    }

    const newHazardousGoods = state.hazardousGoods.map((g) =>
      g.id === order.goods_id ? { ...g, stock_quantity: g.stock_quantity - order.quantity } : g
    )

    const newOutboundOrders = state.outboundOrders.map((o) =>
      o.id === orderId ? { ...o, status: 'completed' as const } : o
    )

    persistData({
      hazardousGoods: newHazardousGoods,
      warehouses: state.warehouses,
      storageLocations: state.storageLocations,
      warehousingOrders: state.warehousingOrders,
      outboundOrders: newOutboundOrders,
      accidentReports: state.accidentReports,
      supervisionReports: state.supervisionReports,
    })

    set({
      hazardousGoods: newHazardousGoods,
      outboundOrders: newOutboundOrders,
    })
    return { success: true, message: '已确认送达，库存已扣减' }
  },

  handleAlert: (id, handler) =>
    set((state) => ({
      alertRecords: state.alertRecords.map((a) =>
        a.id === id ? { ...a, status: '处理中', handler } : a
      ),
    })),

  addAccidentReport: (report) =>
    set((state) => {
      const newList = [
        {
          ...report,
          id: Date.now().toString(),
          report_no: `SG${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${(state.accidentReports.length + 1).toString().padStart(3, '0')}`,
        },
        ...state.accidentReports,
      ]
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: state.outboundOrders,
        accidentReports: newList,
        supervisionReports: state.supervisionReports,
      })
      return { accidentReports: newList }
    }),

  updateSupervisionReport: (id, data) =>
    set((state) => {
      const newList = state.supervisionReports.map((r) =>
        r.id === id ? { ...r, ...data } : r
      )
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: newList,
      })
      return { supervisionReports: newList }
    }),

  batchUpdateSupervisionReports: (ids, data) =>
    set((state) => {
      const idSet = new Set(ids)
      const newList = state.supervisionReports.map((r) =>
        idSet.has(r.id) ? { ...r, ...data } : r
      )
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: state.storageLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: newList,
      })
      return { supervisionReports: newList }
    }),

  updateStorageLocation: (id, data) =>
    set((state) => {
      const newLocations = state.storageLocations.map((loc) =>
        loc.id === id ? { ...loc, ...data } : loc
      )
      persistData({
        hazardousGoods: state.hazardousGoods,
        warehouses: state.warehouses,
        storageLocations: newLocations,
        warehousingOrders: state.warehousingOrders,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { storageLocations: newLocations }
    }),

  getStorageLocationByCode: (warehouseId, code) => {
    return get().storageLocations.find(
      (loc) => loc.warehouse_id === warehouseId && loc.code === code
    )
  },
}))
