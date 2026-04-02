import { api } from './api'

export interface Schedule {
  _id: string
  userId: string
  applianceId: string
  taskId: string
  intervalDays: number
  lastCompletedAt: string | null
  nextDueAt: string
  snoozedUntil: string | null
  isActive: boolean
  appliance: { _id: string; name: string; typeId: string } | null
  task: {
    taskId: string
    label: string
    intervalDays: number
    diyUrl: string
    thumbtackCategory: string
    angiCategory: string
    priority: 'high' | 'medium' | 'low'
    notes?: string
  } | null
}

export interface CompletePayload {
  doneBy: 'self' | 'pro'
  completedAt?: string
  notes?: string
  cost?: number
}

export const schedulesApi = {
  getAll: () => api.get<Schedule[]>('/api/schedules'),
  getDue: () => api.get<Schedule[]>('/api/schedules/due'),
  complete: (id: string, payload: CompletePayload) =>
    api.post<Schedule>(`/api/schedules/${id}/complete`, payload),
  snooze: (id: string, days: number) =>
    api.post<Schedule>(`/api/schedules/${id}/snooze`, { days }),
  updateInterval: (id: string, intervalDays: number) =>
    api.put<Schedule>(`/api/schedules/${id}`, { intervalDays }),
}

export function daysUntilDue(nextDueAt: string): number {
  const now = new Date()
  const due = new Date(nextDueAt)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
