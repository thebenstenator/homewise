export interface ApplianceTask {
  taskId: string
  label: string
  intervalDays: number
  diyUrl: string
  thumbtackCategory: string
  angiCategory: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
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
