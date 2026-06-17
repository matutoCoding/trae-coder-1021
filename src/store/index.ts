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
  addOutboundOrder: (order: Omit<OutboundOrder, 'id'>) => void
  updateOutboundOrder: (id: string, data: Partial<OutboundOrder>) => void
  handleAlert: (id: string, handler: string) => void
  addAccidentReport: (report: Omit<AccidentReport, 'id' | 'report_no'>) => void
  updateSupervisionReport: (id: string, data: Partial<SupervisionReport>) => void
  batchUpdateSupervisionReports: (ids: string[], data: Partial<SupervisionReport>) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  hazardousGoods: mockHazardousGoods,
  warehousingOrders: saved?.warehousingOrders || mockWarehousingOrders,
  warehouses: mockWarehouses,
  storageLocations: generateStorageLocations(mockWarehouses),
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
        warehousingOrders: newList,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { warehousingOrders: newList }
    }),

  addOutboundOrder: (order) =>
    set((state) => {
      const newList = [{ ...order, id: Date.now().toString(), reject_reason: (order as any).reject_reason || '' }, ...state.outboundOrders]
      persistData({
        warehousingOrders: state.warehousingOrders,
        outboundOrders: newList,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { outboundOrders: newList }
    }),

  updateOutboundOrder: (id, data) =>
    set((state) => {
      const newList = state.outboundOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      )
      persistData({
        warehousingOrders: state.warehousingOrders,
        outboundOrders: newList,
        accidentReports: state.accidentReports,
        supervisionReports: state.supervisionReports,
      })
      return { outboundOrders: newList }
    }),

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
        warehousingOrders: state.warehousingOrders,
        outboundOrders: state.outboundOrders,
        accidentReports: state.accidentReports,
        supervisionReports: newList,
      })
      return { supervisionReports: newList }
    }),
}))
