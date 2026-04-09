import { api } from './api'
import type { Schedule, CompletePayload } from '../types/appliance'

export type { Schedule, CompletePayload }

export const schedulesApi = {
  getAll: () => api.get<Schedule[]>('/api/schedules'),
  getDue: () => api.get<Schedule[]>('/api/schedules/due'),
  complete: (id: string, payload: CompletePayload) =>
    api.post<Schedule>(`/api/schedules/${id}/complete`, payload),
  snooze: (id: string, days: number) =>
    api.post<Schedule>(`/api/schedules/${id}/snooze`, { days }),
  toggleReminders: (id: string) =>
    api.patch<Schedule>(`/api/schedules/${id}/reminders`),
  updateInterval: (id: string, intervalDays: number) =>
    api.put<Schedule>(`/api/schedules/${id}`, { intervalDays }),
  scheduleNow: (id: string) =>
    api.post<Schedule>(`/api/schedules/${id}/due-now`, {}),
}

export function daysUntilDue(nextDueAt: string): number {
  const now = new Date()
  const due = new Date(nextDueAt)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
