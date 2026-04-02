import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { ApplianceType } from '../types/appliance'

export type { ApplianceType }

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
