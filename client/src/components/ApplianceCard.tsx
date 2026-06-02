import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Home, Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves, AlertTriangle, ShieldAlert, GitBranch, Droplet, CircleSlash, Filter } from 'lucide-react'
import type { Appliance } from '../types/appliance'
import { getAgeWarning } from '../lib/applianceLifespans'

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
  hvac: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
  kitchen: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30',
  laundry: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
  plumbing: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30',
  safety: 'bg-red-50 text-red-600 dark:bg-red-900/30',
  exterior: 'bg-green-50 text-green-600 dark:bg-green-900/30',
  electrical: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30',
}

interface Props {
  appliance: Appliance
  onEdit: (appliance: Appliance) => void
  onDelete: (id: string) => void
  dueCount?: number
}

export function ApplianceCard({ appliance, onEdit, onDelete, dueCount = 0 }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const type = appliance.applianceType
  const Icon = type ? (iconMap[type.iconSlug] ?? Home) : Home
  const colorClass = type ? (categoryColors[type.category] ?? 'bg-slate-50 text-slate-600 dark:bg-slate-800') : 'bg-slate-50 text-slate-600 dark:bg-slate-800'
  const ageWarning = getAgeWarning(appliance.typeId, appliance.installYear)

  return (
    <Link
      to={`/appliances/${appliance._id}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-3 h-44 hover:border-green-400 hover:shadow-sm transition-all cursor-pointer dark:shadow-none"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={20} />
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.preventDefault(); onEdit(appliance) }}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Edit appliance"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setConfirmDelete(true) }}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            aria-label="Delete appliance"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="h-10">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{appliance.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {[appliance.brand, appliance.model].filter(Boolean).join(' · ') || ' '}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className={`text-xs ${dueCount > 0 ? 'text-amber-600 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
            {dueCount > 0 ? `${dueCount} task${dueCount !== 1 ? 's' : ''} due` : 'No tasks due'}
          </span>
          {ageWarning && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${ageWarning.level === 'past' ? 'text-red-600' : 'text-amber-600'}`}>
              <AlertTriangle size={11} />
              Aging
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-green-600">View Tasks →</span>
      </div>

      {confirmDelete && (
        <div
          onClick={(e) => e.preventDefault()}
          className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-3 p-4 border border-red-200 dark:border-red-800 z-10"
        >
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 text-center">Delete "{appliance.name}"?</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">This will also remove its maintenance history.</p>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setConfirmDelete(false) }}
              className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={(e) => { e.preventDefault(); onDelete(appliance._id); setConfirmDelete(false) }}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Link>
  )
}
