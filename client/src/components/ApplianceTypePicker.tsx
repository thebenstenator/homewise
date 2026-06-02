import { useState } from 'react'
import {
  Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves,
  AlertTriangle, ShieldAlert, Home, GitBranch, Droplet, CircleSlash, Filter,
} from 'lucide-react'
import { useApplianceTypes } from '../hooks/useApplianceTypes'
import type { ApplianceType } from '../types/appliance'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  thermometer: Thermometer,
  wind: Wind,
  flame: Flame,
  zap: Zap,
  refrigerator: Refrigerator,
  droplets: Droplets,
  waves: Waves,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,
  home: Home,
  'git-branch': GitBranch,
  droplet: Droplet,
  'circle-slash': CircleSlash,
  filter: Filter,
}

const categoryLabels: Record<string, string> = {
  hvac: 'HVAC',
  kitchen: 'Kitchen',
  laundry: 'Laundry',
  plumbing: 'Plumbing',
  safety: 'Safety',
  exterior: 'Exterior',
  electrical: 'Electrical',
}

const categoryOrder = ['hvac', 'kitchen', 'laundry', 'plumbing', 'safety', 'exterior', 'electrical']

interface Props {
  onSelect: (type: ApplianceType) => void
}

export function ApplianceTypePicker({ onSelect }: Props) {
  const { types, loading, error } = useApplianceTypes()
  const [search, setSearch] = useState('')

  const filtered = types.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = categoryOrder.reduce<Record<string, ApplianceType[]>>((acc, cat) => {
    const matches = filtered.filter((t) => t.category === cat)
    if (matches.length > 0) acc[cat] = matches
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-600 text-sm py-4">Failed to load appliance types: {error}</p>
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search appliances…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
      />

      {Object.entries(grouped).map(([category, items]) => {
        return (
          <div key={category} className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {categoryLabels[category] ?? category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {items.map((type) => {
                const Icon = iconMap[type.iconSlug] ?? Home
                return (
                  <button
                    key={type._id}
                    onClick={() => onSelect(type)}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors text-left dark:bg-slate-800"
                  >
                    <Icon size={18} className="text-green-600 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-200 leading-tight">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {Object.keys(grouped).length === 0 && (
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No appliances match "{search}"</p>
      )}
    </div>
  )
}
