import { api } from './api'
import { ApplianceType } from '../hooks/useApplianceTypes'

export interface Appliance {
  _id: string
  userId: string
  typeId: string
  name: string
  brand?: string
  model?: string
  installYear?: number
  notes?: string
  createdAt: string
  applianceType: ApplianceType | null
}

export interface ApplianceFormData {
  typeId: string
  name: string
  brand?: string
  model?: string
  installYear?: number
  notes?: string
}

export const appliancesApi = {
  getAll: () => api.get<Appliance[]>('/api/appliances'),
  create: (data: ApplianceFormData) => api.post<Appliance>('/api/appliances', data),
  update: (id: string, data: Partial<ApplianceFormData>) =>
    api.put<Appliance>(`/api/appliances/${id}`, data),
  remove: (id: string) => api.del<{ message: string }>(`/api/appliances/${id}`),
}
