import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Thermometer, Wind, Flame, Zap, Refrigerator, Droplets, Waves,
  AlertTriangle, ShieldAlert, Home, GitBranch, Droplet, CircleSlash, Filter, ChevronLeft, Download, DollarSign, ChevronDown, ChevronUp, Share2, Copy, Trash2, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '../components/AppLayout'
import { historyApi } from '../lib/history'
import { appliancesApi } from '../lib/appliances'
import { api } from '../lib/api'
import type { MaintenanceLog, Appliance, SpendingStats } from '../types/appliance'
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

function exportCsv(logs: MaintenanceLog[]) {
  const rows: string[][] = [
    ['Date', 'Appliance', 'Task', 'Done By', 'Cost', 'Notes'],
    ...logs.map((log) => [
      new Date(log.completedAt).toLocaleDateString(),
      log.applianceId.name,
      log.taskLabel,
      log.doneBy === 'pro' ? 'Pro' : 'DIY',
      log.cost != null ? String(log.cost) : '',
      log.notes ?? '',
    ]),
  ]
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `homewise-maintenance-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
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
  const [spending, setSpending] = useState<SpendingStats | null>(null)
  const [showSpending, setShowSpending] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [sharingBusy, setSharingBusy] = useState(false)
  const { types } = useApplianceTypes()

  useEffect(() => {
    appliancesApi.getAll().then(setAppliances)
    historyApi.getSpending().then(setSpending).catch(() => {})
    api.get<{ shareToken: string | null }>('/api/users/me/share-token')
      .then((r) => setShareToken(r.shareToken))
      .catch(() => {})
  }, [])

  async function handleGenerateShareLink() {
    setSharingBusy(true)
    try {
      const r = await api.post<{ shareToken: string }>('/api/users/share-token', {})
      setShareToken(r.shareToken)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create link')
    } finally {
      setSharingBusy(false)
    }
  }

  async function handleRevokeShareLink() {
    setSharingBusy(true)
    try {
      await api.del('/api/users/share-token')
      setShareToken(null)
      toast.success('Share link revoked')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke link')
    } finally {
      setSharingBusy(false)
    }
  }

  function shareUrl(token: string) {
    return `${window.location.origin}/shared/${token}`
  }

  async function copyShareLink(token: string) {
    await navigator.clipboard.writeText(shareUrl(token))
    toast.success('Link copied to clipboard')
  }

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
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Maintenance History</h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedAppliance}
            onChange={(e) => setSelectedAppliance(e.target.value)}
            className="flex-1 sm:flex-none border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">All appliances</option>
            {appliances.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
          {logs.length > 0 && (
            <button
              onClick={() => exportCsv(logs)}
              className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <Download size={15} />
              Export CSV
            </button>
          )}
          <button
            onClick={() => setShowShare((v) => !v)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 ${
              shareToken
                ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Share2 size={15} />
            {shareToken ? 'Sharing on' : 'Share'}
          </button>
        </div>
      </div>

      {/* Spending summary */}
      {spending && spending.total > 0 && (
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:shadow-none overflow-hidden">
          <button
            onClick={() => setShowSpending((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Maintenance Spending</span>
              <span className="text-sm font-bold text-green-600">${spending.total.toLocaleString()}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">total tracked</span>
            </div>
            {showSpending ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {showSpending && (
            <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">By Appliance</p>
                  <div className="flex flex-col gap-1.5">
                    {spending.byAppliance.map((row) => (
                      <div key={row.applianceId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-200 truncate mr-2">{row.applianceName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{row.count}×</span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">${row.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">By Year</p>
                  <div className="flex flex-col gap-1.5">
                    {spending.byYear.map((row) => (
                      <div key={row.year} className="flex items-center justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-200">{row.year}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 dark:text-slate-500">{row.count} task{row.count !== 1 ? 's' : ''}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-100">${row.total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share panel */}
      {showShare && (
        <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 dark:shadow-none">
          <div className="flex items-center gap-2 mb-3">
            <Share2 size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Share Maintenance History</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Generate a read-only link you can share with contractors, landlords, or inspectors. Costs are not included.
          </p>
          {shareToken ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate font-mono">{shareUrl(shareToken)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => copyShareLink(shareToken)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Copy size={12} /> Copy link
                </button>
                <button
                  onClick={handleGenerateShareLink}
                  disabled={sharingBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  onClick={handleRevokeShareLink}
                  disabled={sharingBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={12} /> Revoke
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateShareLink}
              disabled={sharingBusy}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Share2 size={14} /> {sharingBusy ? 'Generating…' : 'Create share link'}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No maintenance logged yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Mark a task complete to start your maintenance record.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ label, logs: monthLogs }) => (
            <div key={label}>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
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
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-4 dark:shadow-none"
                    >
                      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg shrink-0">
                        <Icon size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{appliance.name}</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{log.taskLabel}</p>
                        {log.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{log.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500">{date}</p>
                        <div className="flex items-center gap-2">
                          {log.cost != null && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">${log.cost}</span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              log.doneBy === 'pro'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
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
