import { api } from './api'
import type { Appliance, ApplianceFormData } from '../types/appliance'

export type { Appliance, ApplianceFormData }

export const appliancesApi = {
  getAll: () => api.get<Appliance[]>('/api/appliances'),
  create: (data: ApplianceFormData) => api.post<Appliance>('/api/appliances', data),
  update: (id: string, data: Partial<ApplianceFormData>) =>
    api.put<Appliance>(`/api/appliances/${id}`, data),
  remove: (id: string) => api.del<{ message: string }>(`/api/appliances/${id}`),
  uploadPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.upload<{ url: string }>('/api/appliances/upload-photo', formData)
  },
}
