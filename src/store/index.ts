import { create } from 'zustand'
import type {
  HazardousGoods,
  WarehousingOrder,
  Warehouse,
  StorageLocation,
  LocationBatch,
  BatchInventory,
  OutboundOrder,
  OutboundBatchAllocation,
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

function doPersist(state: PersistedData) {
  persistData(state)
}

function computeBatchInventory(
  storageLocations: StorageLocation[],
  warehouses: Warehouse[],
  goods: HazardousGoods[]
): BatchInventory[] {
  const result: BatchInventory[] = []
  for (const loc of storageLocations) {
    const wh = warehouses.find(w => w.id === loc.warehouse_id)
    for (const batch of loc.batches) {
      const g = goods.find(gg => gg.id === batch.goods_id)
      result.push({
        id: `${loc.id}-${batch.batch_no}`,
        batch_no: batch.batch_no,
        goods_id: batch.goods_id,
        goods_name: batch.goods_name,
        warehouse_id: loc.warehouse_id,
        warehouse_name: wh?.name || '',
        location_id: loc.id,
        location_code: loc.code,
        total_quantity: batch.quantity,
        remaining_quantity: batch.quantity,
        unit: g?.unit || '',
        warehousing_order_id: batch.warehousing_order_id,
        warehousing_order_no: batch.warehousing_order_no,
        in_date: batch.in_date,
      })
    }
  }
  return result
}

function computeGoodsStock(
  goods: HazardousGoods[],
  storageLocations: StorageLocation[]
): HazardousGoods[] {
  return goods.map(g => {
    let total = 0
    for (const loc of storageLocations) {
      for (const batch of loc.batches) {
        if (batch.goods_id === g.id) {
          total += batch.quantity
        }
      }
    }
    const newStatus: 'normal' | 'warning' | 'danger' =
      total <= 0 ? 'danger' : total <= g.min_stock ? 'warning' : 'normal'
    return { ...g, stock_quantity: total, status: newStatus }
  })
}

function computeWarehouseCapacity(
  warehouses: Warehouse[],
  storageLocations: StorageLocation[]
): Warehouse[] {
  return warehouses.map(wh => {
    let used = 0
    for (const loc of storageLocations) {
      if (loc.warehouse_id === wh.id) {
        used += loc.used_capacity
      }
    }
    const newStatus: 'normal' | 'warning' | 'danger' =
      wh.gas_concentration >= wh.gas_threshold ? 'danger' :
      wh.temperature >= wh.temperature_threshold || wh.humidity >= wh.humidity_threshold ? 'warning' : 'normal'
    return { ...wh, used_capacity: used, status: newStatus }
  })
}

function computeLocationStatus(loc: StorageLocation): StorageLocation {
  const used = loc.batches.reduce((sum, b) => sum + b.quantity, 0)
  const status: 'empty' | 'partial' | 'full' = used === 0 ? 'empty' : used >= loc.capacity * 0.9 ? 'full' : 'partial'
  return { ...loc, used_capacity: used, status }
}

function getFIFOAllocations(
  goodsId: string,
  quantity: number,
  storageLocations: StorageLocation[]
): OutboundBatchAllocation[] {
  const allBatches: { batch_no: string; location_id: string; location_code: string; quantity: number; in_date: string }[] = []
  for (const loc of storageLocations) {
    for (const batch of loc.batches) {
      if (batch.goods_id === goodsId && batch.quantity > 0) {
        allBatches.push({
          batch_no: batch.batch_no,
          location_id: loc.id,
          location_code: loc.code,
          quantity: batch.quantity,
          in_date: batch.in_date,
        })
      }
    }
  }
  allBatches.sort((a, b) => a.in_date.localeCompare(b.in_date))

  const allocations: OutboundBatchAllocation[] = []
  let remaining = quantity
  for (const b of allBatches) {
    if (remaining <= 0) break
    const take = Math.min(remaining, b.quantity)
    allocations.push({
      batch_no: b.batch_no,
      location_id: b.location_id,
      location_code: b.location_code,
      quantity: take,
    })
    remaining -= take
  }
  return allocations
}

function applyBatchDeduction(
  storageLocations: StorageLocation[],
  allocations: OutboundBatchAllocation[]
): StorageLocation[] {
  return storageLocations.map(loc => {
    const newBatches = loc.batches.map(batch => {
      const alloc = allocations.find(a => a.batch_no === batch.batch_no && a.location_id === loc.id)
      if (alloc) {
        const newQty = batch.quantity - alloc.quantity
        if (newQty <= 0) return null
        return { ...batch, quantity: newQty }
      }
      return batch
    }).filter((b): b is LocationBatch => b !== null)

    return computeLocationStatus({ ...loc, batches: newBatches })
  })
}

interface AppState {
  hazardousGoods: HazardousGoods[]
  warehousingOrders: WarehousingOrder[]
  warehouses: Warehouse[]
  storageLocations: StorageLocation[]
  batchInventory: BatchInventory[]
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
  processWarehousingApproval: (orderId: string, data: { inspector: string; inspection_result: string; inspection_date: string; warehouse_id: string; location_id: string; quantity: number; goods_id: string; goods_name: string; batch_no: string; warehousing_order_id: string; warehousing_order_no: string; in_date: string }) => { success: boolean; message: string }
  addOutboundOrder: (order: Omit<OutboundOrder, 'id' | 'batch_allocations'> & { batch_allocations?: OutboundBatchAllocation[] }) => { success: boolean; message: string }
  updateOutboundOrder: (id: string, data: Partial<OutboundOrder>) => void
  processOutboundCompletion: (orderId: string) => { success: boolean; message: string }
  checkStockAvailable: (goodsId: string, quantity: number) => { available: boolean; currentStock: number; required: number }
  getAvailableLocationsForWarehouse: (warehouseId: string) => StorageLocation[]
  getBatchesForGoods: (goodsId: string) => BatchInventory[]
  getFIFOAllocationsForGoods: (goodsId: string, quantity: number) => OutboundBatchAllocation[]
  handleAlert: (id: string, handler: string) => void
  addAccidentReport: (report: Omit<AccidentReport, 'id' | 'report_no'>) => void
  updateSupervisionReport: (id: string, data: Partial<SupervisionReport>) => void
  batchUpdateSupervisionReports: (ids: string[], data: Partial<SupervisionReport>) => void
  getStorageLocationByCode: (warehouseId: string, code: string) => StorageLocation | undefined
  recalcDerived: () => void
}

const initialLocations = saved?.storageLocations || generateStorageLocations(mockWarehouses)
const initialGoods = computeGoodsStock(mockHazardousGoods, initialLocations)
const initialWarehouses = computeWarehouseCapacity(mockWarehouses, initialLocations)

export const useAppStore = create<AppState>((set, get) => ({
  hazardousGoods: saved?.hazardousGoods || initialGoods,
  warehousingOrders: saved?.warehousingOrders || mockWarehousingOrders,
  warehouses: saved?.warehouses || initialWarehouses,
  storageLocations: initialLocations,
  batchInventory: computeBatchInventory(initialLocations, initialWarehouses, initialGoods),
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

  recalcDerived: () => {
    const state = get()
    const newGoods = computeGoodsStock(state.hazardousGoods, state.storageLocations)
    const newWarehouses = computeWarehouseCapacity(state.warehouses, state.storageLocations)
    const newBatchInv = computeBatchInventory(state.storageLocations, newWarehouses, newGoods)
    doPersist({
      hazardousGoods: newGoods,
      warehouses: newWarehouses,
      storageLocations: state.storageLocations,
      warehousingOrders: state.warehousingOrders,
      outboundOrders: state.outboundOrders,
      accidentReports: state.accidentReports,
      supervisionReports: state.supervisionReports,
    })
    set({ hazardousGoods: newGoods, warehouses: newWarehouses, batchInventory: newBatchInv })
  },

  addWarehousingOrder: (order) =>
    set((state) => {
      const newList = [{ ...order, id: Date.now().toString() }, ...state.warehousingOrders]
      doPersist({ ...state, warehousingOrders: newList })
      return { warehousingOrders: newList }
    }),

  updateWarehousingOrder: (id, data) =>
    set((state) => {
      const newList = state.warehousingOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      )
      doPersist({ ...state, warehousingOrders: newList })
      return { warehousingOrders: newList }
    }),

  processWarehousingApproval: (orderId, data) => {
    const { warehouse_id, location_id, quantity, goods_id, goods_name, batch_no, warehousing_order_id, warehousing_order_no, in_date, ...orderData } = data
    const state = get()
    const order = state.warehousingOrders.find(o => o.id === orderId)
    if (!order) return { success: false, message: '入库单不存在' }

    if (quantity <= 0) return { success: false, message: '入库数量必须大于0' }

    const location = state.storageLocations.find(l => l.id === location_id)
    if (!location) return { success: false, message: '库位不存在' }

    const remainingCapacity = location.capacity - location.used_capacity
    if (quantity > remainingCapacity) {
      return { success: false, message: `库位容量不足，剩余容量${remainingCapacity}，入库数量${quantity}` }
    }

    const newWarehousingOrders = state.warehousingOrders.map((o) =>
      o.id === orderId ? { ...o, ...orderData, status: 'approved' as const, warehouse_id, location_code: location.code } : o
    )

    const newBatch: LocationBatch = {
      batch_no,
      goods_id,
      goods_name,
      quantity,
      warehousing_order_id,
      warehousing_order_no,
      in_date,
    }

    const newStorageLocations = state.storageLocations.map(loc => {
      if (loc.id === location_id) {
        const existingBatchIdx = loc.batches.findIndex(b => b.batch_no === batch_no)
        let newBatches: LocationBatch[]
        if (existingBatchIdx >= 0) {
          newBatches = loc.batches.map((b, i) =>
            i === existingBatchIdx ? { ...b, quantity: b.quantity + quantity } : b
          )
        } else {
          newBatches = [...loc.batches, newBatch]
        }
        return computeLocationStatus({ ...loc, batches: newBatches })
      }
      return loc
    })

    const newGoods = computeGoodsStock(state.hazardousGoods, newStorageLocations)
    const newWarehouses = computeWarehouseCapacity(state.warehouses, newStorageLocations)
    const newBatchInv = computeBatchInventory(newStorageLocations, newWarehouses, newGoods)

    doPersist({
      hazardousGoods: newGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      warehousingOrders: newWarehousingOrders,
      outboundOrders: state.outboundOrders,
      accidentReports: state.accidentReports,
      supervisionReports: state.supervisionReports,
    })

    set({
      hazardousGoods: newGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      warehousingOrders: newWarehousingOrders,
      batchInventory: newBatchInv,
    })
    return { success: true, message: '检验通过，已入库' }
  },

  checkStockAvailable: (goodsId, quantity) => {
    const state = get()
    let totalBatchStock = 0
    for (const loc of state.storageLocations) {
      for (const batch of loc.batches) {
        if (batch.goods_id === goodsId) totalBatchStock += batch.quantity
      }
    }
    return {
      available: totalBatchStock >= quantity,
      currentStock: totalBatchStock,
      required: quantity,
    }
  },

  getAvailableLocationsForWarehouse: (warehouseId) => {
    return get().storageLocations.filter(loc => loc.warehouse_id === warehouseId && loc.status !== 'full')
  },

  getBatchesForGoods: (goodsId) => {
    return get().batchInventory.filter(b => b.goods_id === goodsId && b.remaining_quantity > 0)
  },

  getFIFOAllocationsForGoods: (goodsId, quantity) => {
    return getFIFOAllocations(goodsId, quantity, get().storageLocations)
  },

  addOutboundOrder: (order) => {
    const state = get()
    const check = get().checkStockAvailable(order.goods_id, order.quantity)
    if (!check.available) {
      return { success: false, message: `库存不足，当前可用库存${check.currentStock}${order.unit}，申请${check.required}${order.unit}` }
    }
    const allocations = order.batch_allocations && order.batch_allocations.length > 0
      ? order.batch_allocations
      : getFIFOAllocations(order.goods_id, order.quantity, state.storageLocations)

    if (allocations.reduce((s, a) => s + a.quantity, 0) < order.quantity) {
      return { success: false, message: '可用批次库存不足，无法分配' }
    }

    set((state) => {
      const newList = [{
        ...order,
        id: Date.now().toString(),
        reject_reason: (order as any).reject_reason || '',
        batch_allocations: allocations,
      }, ...state.outboundOrders]
      doPersist({ ...state, outboundOrders: newList })
      return { outboundOrders: newList }
    })
    return { success: true, message: '申请已提交' }
  },

  updateOutboundOrder: (id, data) =>
    set((state) => {
      const newList = state.outboundOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      )
      doPersist({ ...state, outboundOrders: newList })
      return { outboundOrders: newList }
    }),

  processOutboundCompletion: (orderId) => {
    const state = get()
    const order = state.outboundOrders.find(o => o.id === orderId)
    if (!order) return { success: false, message: '订单不存在' }

    const check = get().checkStockAvailable(order.goods_id, order.quantity)
    if (!check.available) {
      return { success: false, message: `库存不足，当前可用库存${check.currentStock}${order.unit}，需出库${check.required}${order.unit}` }
    }

    let allocations = order.batch_allocations
    if (!allocations || allocations.length === 0) {
      allocations = getFIFOAllocations(order.goods_id, order.quantity, state.storageLocations)
    }

    const allocTotal = allocations.reduce((s, a) => s + a.quantity, 0)
    if (allocTotal < order.quantity) {
      allocations = getFIFOAllocations(order.goods_id, order.quantity, state.storageLocations)
    }

    const newStorageLocations = applyBatchDeduction(state.storageLocations, allocations)
    const newGoods = computeGoodsStock(state.hazardousGoods, newStorageLocations)
    const newWarehouses = computeWarehouseCapacity(state.warehouses, newStorageLocations)
    const newBatchInv = computeBatchInventory(newStorageLocations, newWarehouses, newGoods)

    const newOutboundOrders = state.outboundOrders.map((o) =>
      o.id === orderId ? { ...o, status: 'completed' as const, batch_allocations: allocations } : o
    )

    doPersist({
      hazardousGoods: newGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      warehousingOrders: state.warehousingOrders,
      outboundOrders: newOutboundOrders,
      accidentReports: state.accidentReports,
      supervisionReports: state.supervisionReports,
    })

    set({
      hazardousGoods: newGoods,
      warehouses: newWarehouses,
      storageLocations: newStorageLocations,
      outboundOrders: newOutboundOrders,
      batchInventory: newBatchInv,
    })
    return { success: true, message: '已确认送达，库存已按批次扣减' }
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
      doPersist({ ...state, accidentReports: newList })
      return { accidentReports: newList }
    }),

  updateSupervisionReport: (id, data) =>
    set((state) => {
      const newList = state.supervisionReports.map((r) =>
        r.id === id ? { ...r, ...data } : r
      )
      doPersist({ ...state, supervisionReports: newList })
      return { supervisionReports: newList }
    }),

  batchUpdateSupervisionReports: (ids, data) =>
    set((state) => {
      const idSet = new Set(ids)
      const newList = state.supervisionReports.map((r) =>
        idSet.has(r.id) ? { ...r, ...data } : r
      )
      doPersist({ ...state, supervisionReports: newList })
      return { supervisionReports: newList }
    }),

  getStorageLocationByCode: (warehouseId, code) => {
    return get().storageLocations.find(
      (loc) => loc.warehouse_id === warehouseId && loc.code === code
    )
  },
}))
