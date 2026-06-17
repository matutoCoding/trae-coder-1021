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
}

export const useAppStore = create<AppState>((set) => ({
  hazardousGoods: mockHazardousGoods,
  warehousingOrders: mockWarehousingOrders,
  warehouses: mockWarehouses,
  storageLocations: generateStorageLocations(mockWarehouses),
  outboundOrders: mockOutboundOrders,
  safetyDevices: mockSafetyDevices,
  personnel: mockPersonnel,
  emergencyPlans: mockEmergencyPlans,
  emergencyResources: mockEmergencyResources,
  accidentReports: mockAccidentReports,
  supervisionReports: mockSupervisionReports,
  gasSensors: mockGasSensors,
  cameras: mockCameras,
  alertRecords: mockAlertRecords,
  currentUser: { name: '张伟', role: '仓库管理员' },

  addWarehousingOrder: (order) =>
    set((state) => ({
      warehousingOrders: [
        { ...order, id: Date.now().toString() },
        ...state.warehousingOrders,
      ],
    })),

  updateWarehousingOrder: (id, data) =>
    set((state) => ({
      warehousingOrders: state.warehousingOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),

  addOutboundOrder: (order) =>
    set((state) => ({
      outboundOrders: [
        { ...order, id: Date.now().toString() },
        ...state.outboundOrders,
      ],
    })),

  updateOutboundOrder: (id, data) =>
    set((state) => ({
      outboundOrders: state.outboundOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),

  handleAlert: (id, handler) =>
    set((state) => ({
      alertRecords: state.alertRecords.map((a) =>
        a.id === id ? { ...a, status: '处理中', handler } : a
      ),
    })),

  addAccidentReport: (report) =>
    set((state) => ({
      accidentReports: [
        {
          ...report,
          id: Date.now().toString(),
          report_no: `SG${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${(state.accidentReports.length + 1).toString().padStart(3, '0')}`,
        },
        ...state.accidentReports,
      ],
    })),
}))
