import { useState, useEffect } from 'react'
import { api } from '../lib/api'

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

// Module-level cache — this data never changes
let cachedTypes: ApplianceType[] | null = null

export function useApplianceTypes() {
  const [types, setTypes] = useState<ApplianceType[]>(cachedTypes ?? [])
  const [loading, setLoading] = useState(!cachedTypes)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedTypes) return

    api
      .get<ApplianceType[]>('/api/appliance-types')
      .then((data) => {
        cachedTypes = data
        setTypes(data)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { types, loading, error }
}
