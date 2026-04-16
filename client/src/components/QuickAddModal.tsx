import { useState } from 'react'
import { X, Home } from 'lucide-react'
import {
  Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves,
  AlertTriangle, ShieldAlert, GitBranch, Droplet, CircleSlash, Filter,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useModalClose } from '../hooks/useModalClose'
import { useApplianceTypes } from '../hooks/useApplianceTypes'
import { appliancesApi } from '../lib/appliances'
import type { Appliance, ApplianceType } from '../types/appliance'

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
  plumbing: 'Plumbing',
  safety: 'Safety',
  exterior: 'Exterior',
  electrical: 'Electrical',
}

const categoryOrder = ['hvac', 'kitchen', 'plumbing', 'safety', 'exterior', 'electrical']

interface Props {
  ownedTypeIds: string[]
  onClose: () => void
  onCreated: (appliances: Appliance[]) => void
}

export function QuickAddModal({ ownedTypeIds, onClose, onCreated }: Props) {
  useModalClose(onClose)
  const { types, loading } = useApplianceTypes()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sharedDate, setSharedDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const available = types.filter((t) => !ownedTypeIds.includes(t._id))

  const grouped = categoryOrder.reduce<Record<string, ApplianceType[]>>((acc, cat) => {
    const matches = available.filter((t) => t.category === cat)
    if (matches.length > 0) acc[cat] = matches
    return acc
  }, {})

  function toggleType(typeId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(typeId)) next.delete(typeId)
      else next.add(typeId)
      return next
    })
  }

  function toggleCategory(cat: string) {
    const catIds = (grouped[cat] ?? []).map((t) => t._id)
    const allChecked = catIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allChecked) catIds.forEach((id) => next.delete(id))
      else catIds.forEach((id) => next.add(id))
      return next
    })
  }

  async function handleSubmit() {
    const selectedTypes = types.filter((t) => selected.has(t._id))
    setSubmitting(true)
    const created: Appliance[] = []
    try {
      for (const type of selectedTypes) {
        const appliance = await appliancesApi.create({
          typeId: type._id,
          name: type.label,
          lastServiceDate: sharedDate || undefined,
        })
        created.push(appliance)
      }
      onCreated(created)
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const selectedCount = selected.size
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Quick Add Appliances</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select all the appliances in your home</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Shared date */}
        <div className="px-5 py-4 border-b border-slate-100 shrink-0">
          <label className="text-sm font-medium text-slate-700">
            Last service date{' '}
            <span className="text-slate-400 font-normal">(optional — applies to all)</span>
          </label>
          <input
            type="date"
            value={sharedDate}
            onChange={(e) => setSharedDate(e.target.value)}
            max={today}
            disabled={submitting}
            className="mt-1.5 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          />
        </div>

        {/* Type list */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : available.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-slate-700 font-medium">You've added all appliance types!</p>
              <p className="text-slate-500 text-sm mt-1">
                Use "Add Appliance" to add more of the same type.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => {
              const catIds = items.map((t) => t._id)
              const allChecked = catIds.every((id) => selected.has(id))
              return (
                <div key={cat} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {categoryLabels[cat] ?? cat}
                    </h3>
                    <button
                      onClick={() => toggleCategory(cat)}
                      disabled={submitting}
                      className="text-xs text-green-600 hover:underline disabled:opacity-50"
                    >
                      {allChecked ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {items.map((type) => {
                      const Icon = iconMap[type.iconSlug] ?? Home
                      const checked = selected.has(type._id)
                      return (
                        <button
                          key={type._id}
                          onClick={() => toggleType(type._id)}
                          disabled={submitting}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left w-full disabled:opacity-50 ${
                            checked
                              ? 'border-green-400 bg-green-50'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              checked ? 'bg-green-600 border-green-600' : 'border-slate-300'
                            }`}
                          >
                            {checked && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <Icon
                            size={16}
                            className={checked ? 'text-green-600 shrink-0' : 'text-slate-400 shrink-0'}
                          />
                          <span className="text-sm text-slate-700">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {available.length > 0 && (
          <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedCount === 0 || submitting}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding…
                </>
              ) : selectedCount === 0 ? (
                'Add Appliances'
              ) : (
                `Add ${selectedCount} Appliance${selectedCount !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
