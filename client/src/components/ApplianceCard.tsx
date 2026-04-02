import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Home, Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves, AlertTriangle, ShieldAlert, GitBranch, Droplet, CircleSlash, Filter } from 'lucide-react'
import type { Appliance } from '../types/appliance'

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

const categoryColors: Record<string, string> = {
  hvac: 'bg-blue-50 text-blue-600',
  kitchen: 'bg-orange-50 text-orange-600',
  plumbing: 'bg-cyan-50 text-cyan-600',
  safety: 'bg-red-50 text-red-600',
  exterior: 'bg-green-50 text-green-600',
  electrical: 'bg-yellow-50 text-yellow-600',
}

interface Props {
  appliance: Appliance
  onEdit: (appliance: Appliance) => void
  onDelete: (id: string) => void
}

export function ApplianceCard({ appliance, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const type = appliance.applianceType
  const Icon = type ? (iconMap[type.iconSlug] ?? Home) : Home
  const colorClass = type ? (categoryColors[type.category] ?? 'bg-slate-50 text-slate-600') : 'bg-slate-50 text-slate-600'

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(appliance)}
            className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Edit appliance"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
            aria-label="Delete appliance"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 leading-tight">{appliance.name}</h3>
        {(appliance.brand || appliance.model) && (
          <p className="text-xs text-slate-500 mt-0.5">
            {[appliance.brand, appliance.model].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">0 tasks due</span>
        <Link
          to={`/appliances/${appliance._id}`}
          className="text-xs font-medium text-green-600 hover:text-green-700"
        >
          View Tasks →
        </Link>
      </div>

      {confirmDelete && (
        <div className="absolute inset-0 bg-white rounded-xl flex flex-col items-center justify-center gap-3 p-4 border border-red-200 z-10">
          <p className="text-sm font-medium text-slate-800 text-center">Delete "{appliance.name}"?</p>
          <p className="text-xs text-slate-500 text-center">This will also remove its maintenance history.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(appliance._id); setConfirmDelete(false) }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
