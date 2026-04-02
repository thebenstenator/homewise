import { api } from './api'
import type { MaintenanceLog, HomeHealthStats } from '../types/appliance'

export const historyApi = {
  getAll: (applianceId?: string) => {
    const qs = applianceId ? `?applianceId=${applianceId}` : ''
    return api.get<MaintenanceLog[]>(`/api/history${qs}`)
  },
  getStats: () => api.get<HomeHealthStats>('/api/history/stats'),
}
