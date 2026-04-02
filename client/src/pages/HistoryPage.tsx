import { useState, useEffect } from 'react'
import {
  Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves,
  AlertTriangle, ShieldAlert, Home, GitBranch, Droplet, CircleSlash, Filter,
} from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { historyApi } from '../lib/history'
import { appliancesApi } from '../lib/appliances'
import type { MaintenanceLog, Appliance } from '../types/appliance'
import { useApplianceTypes } from '../hooks/useApplianceTypes'

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

function groupByMonth(logs: MaintenanceLog[]): { label: string; logs: MaintenanceLog[] }[] {
  const groups: Record<string, MaintenanceLog[]> = {}
  for (const log of logs) {
    const date = new Date(log.completedAt)
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return Object.entries(groups).map(([label, logs]) => ({ label, logs }))
}

export function HistoryPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [selectedAppliance, setSelectedAppliance] = useState('')
  const [loading, setLoading] = useState(true)
  const { types } = useApplianceTypes()

  useEffect(() => {
    appliancesApi.getAll().then(setAppliances)
  }, [])

  useEffect(() => {
    setLoading(true)
    historyApi
      .getAll(selectedAppliance || undefined)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [selectedAppliance])

  const grouped = groupByMonth(logs)

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Maintenance History</h1>
        <select
          value={selectedAppliance}
          onChange={(e) => setSelectedAppliance(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All appliances</option>
          {appliances.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">No maintenance logged yet</h2>
          <p className="text-slate-500 text-sm">
            Mark a task complete to start your maintenance record.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ label, logs: monthLogs }) => (
            <div key={label}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {label}
              </h2>
              <div className="flex flex-col gap-2">
                {monthLogs.map((log) => {
                  const appliance = log.applianceId
                  const type = types.find((t) => t._id === appliance.typeId)
                  const Icon = type ? (iconMap[type.iconSlug] ?? Home) : Home
                  const date = new Date(log.completedAt).toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric',
                  })

                  return (
                    <div
                      key={log._id}
                      className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-4"
                    >
                      <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <Icon size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 truncate">{appliance.name}</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{log.taskLabel}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="text-xs text-slate-400">{date}</p>
                        <div className="flex items-center gap-2">
                          {log.cost != null && (
                            <span className="text-xs text-slate-500">${log.cost}</span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              log.doneBy === 'pro'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {log.doneBy === 'pro' ? 'Pro' : 'DIY'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
