import { api } from './api'
import type { Schedule, CompletePayload } from '../types/appliance'

export type { Schedule, CompletePayload }

export const schedulesApi = {
  getAll: () => api.get<Schedule[]>('/api/schedules'),
  getAllWithDisabled: () => api.get<Schedule[]>('/api/schedules?includeDisabled=true'),
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
  skip: (id: string) =>
    api.post<Schedule>(`/api/schedules/${id}/skip`, {}),
  updateSettings: (id: string, settings: { intervalDays?: number; customNotes?: string; isActive?: boolean }) =>
    api.put<Schedule>(`/api/schedules/${id}`, settings),
}

export function daysUntilDue(nextDueAt: string): number {
  const now = new Date()
  const due = new Date(nextDueAt)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatInterval(days: number): string {
  if (days === 1) return 'Daily'
  if (days === 7) return 'Weekly'
  if (days === 14) return 'Every 2 weeks'
  if (days === 30) return 'Monthly'
  if (days === 60) return 'Every 2 months'
  if (days === 90) return 'Every 3 months'
  if (days === 120) return 'Every 4 months'
  if (days === 180) return 'Every 6 months'
  if (days === 365) return 'Yearly'
  if (days % 365 === 0) return `Every ${days / 365} years`
  return `Every ${days} days`
}
