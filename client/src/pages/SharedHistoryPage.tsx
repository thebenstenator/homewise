import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Home } from 'lucide-react'
import { api } from '../lib/api'

interface SharedLog {
  _id: string
  applianceId: { _id: string; name: string; typeId: string }
  taskLabel: string
  completedAt: string
  doneBy: 'self' | 'pro'
  notes?: string
}

interface SharedAppliance {
  _id: string
  name: string
  typeId: string
  brand?: string
  model?: string
  installYear?: number
}

interface SharedData {
  ownerName: string
  appliances: SharedAppliance[]
  logs: SharedLog[]
}

function groupByMonth(logs: SharedLog[]) {
  const groups: Record<string, SharedLog[]> = {}
  for (const log of logs) {
    const date = new Date(log.completedAt)
    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(log)
  }
  return Object.entries(groups).map(([label, logs]) => ({ label, logs }))
}

export function SharedHistoryPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<SharedData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<SharedData>(`/api/shared/${token}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Link not found</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{error || 'This share link has been revoked or does not exist.'}</p>
        </div>
      </div>
    )
  }

  const grouped = groupByMonth(data.logs)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-green-600 mb-1">HomeWise</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.ownerName}'s Maintenance History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {data.appliances.length} appliance{data.appliances.length !== 1 ? 's' : ''} · {data.logs.length} maintenance event{data.logs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Appliances summary */}
        {data.appliances.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6 dark:shadow-none">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Appliances</h2>
            <div className="grid grid-cols-2 gap-2">
              {data.appliances.map((a) => (
                <div key={a._id} className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Home size={14} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{a.name}</p>
                    {(a.brand || a.installYear) && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {[a.brand, a.installYear ? `Installed ${a.installYear}` : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance log */}
        {data.logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No maintenance logged yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {grouped.map(({ label, logs: monthLogs }) => (
              <div key={label}>
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{label}</h2>
                <div className="flex flex-col gap-2">
                  {monthLogs.map((log) => {
                    const date = new Date(log.completedAt).toLocaleDateString('default', { month: 'short', day: 'numeric' })
                    return (
                      <div key={log._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-4 dark:shadow-none">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg shrink-0">
                          <Home size={16} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{log.applianceId.name}</p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{log.taskLabel}</p>
                          {log.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{log.notes}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400 dark:text-slate-500">{date}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.doneBy === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'}`}>
                            {log.doneBy === 'pro' ? 'Pro' : 'DIY'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-10">
          Shared via <span className="font-medium text-green-600">HomeWise</span> — home maintenance tracking
        </p>
      </div>
    </div>
  )
}
