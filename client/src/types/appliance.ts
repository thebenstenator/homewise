export interface ApplianceProduct {
  label: string
  searchUrl: string
}

export interface ApplianceTask {
  taskId: string
  label: string
  intervalDays: number
  diyUrl: string
  thumbtackCategory: string
  angiCategory: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
  products?: ApplianceProduct[]
  isReminder?: boolean
  steps?: string[]
}

export interface ApplianceType {
  _id: string
  label: string
  category: 'hvac' | 'plumbing' | 'electrical' | 'kitchen' | 'exterior' | 'safety'
  iconSlug: string
  tasks: ApplianceTask[]
}

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

export interface ScheduleTask {
  taskId: string
  label: string
  intervalDays: number
  diyUrl: string
  thumbtackCategory: string
  angiCategory: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
  products?: ApplianceProduct[]
  isReminder?: boolean
  steps?: string[]
}

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
  task: ScheduleTask | null
}

export interface CompletePayload {
  doneBy: 'self' | 'pro'
  completedAt?: string
  notes?: string
  cost?: number
}

export interface MaintenanceLog {
  _id: string
  applianceId: { _id: string; name: string; typeId: string }
  taskId: string
  taskLabel: string
  completedAt: string
  notes?: string
  cost?: number
  doneBy: 'self' | 'pro'
}

export interface HomeHealthStats {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  overdueCount: number
  dueSoonCount: number
  completedLast30: number
  totalAppliances: number
}
