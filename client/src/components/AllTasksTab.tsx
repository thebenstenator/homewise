import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutList, Layers } from 'lucide-react'
import type { Schedule } from '../types/appliance'
import { daysUntilDue } from '../lib/schedules'

type StatusFilter = 'all' | 'overdue' | 'soon' | 'upcoming'
type GroupMode = 'date' | 'appliance'

function formatInterval(days: number): string {
  if (days === 7) return 'Weekly'
  if (days === 14) return 'Every 2 weeks'
  if (days === 30) return 'Monthly'
  if (days === 60) return 'Every 2 months'
  if (days === 90) return 'Every 3 months'
  if (days === 120) return 'Every 4 months'
  if (days === 180) return 'Every 6 months'
  if (days === 365) return 'Yearly'
  return `Every ${days} days`
}

function dueBadge(days: number): { label: string; className: string } {
  if (days < 0) return { label: `Overdue ${Math.abs(days)}d`, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
  if (days === 0) return { label: 'Due today', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  if (days <= 7) return { label: `Due in ${days}d`, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  if (days <= 30) return { label: `In ${days} days`, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
  const months = Math.round(days / 30)
  return { label: `In ~${months}mo`, className: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' }
}

const priorityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-blue-400',
}

function TaskRow({ schedule }: { schedule: Schedule }) {
  const days = daysUntilDue(schedule.nextDueAt)
  const badge = dueBadge(days)
  const dot = priorityDot[schedule.task?.priority ?? 'low'] ?? 'bg-slate-400'
  const dueDate = new Date(schedule.nextDueAt).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
  const lastDone = schedule.lastCompletedAt
    ? new Date(schedule.lastCompletedAt).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <Link
      to={`/appliances/${schedule.applianceId}`}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors dark:shadow-none"
    >
      <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          {schedule.task?.label ?? schedule.taskId}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {schedule.appliance?.name ?? 'Unknown appliance'}
          {lastDone && <span className="ml-2 text-slate-400 dark:text-slate-500">· Last: {lastDone}</span>}
        </p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatInterval(schedule.intervalDays)}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 dark:text-slate-500">{dueDate}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>{badge.label}</span>
        </div>
      </div>
    </Link>
  )
}

interface Props {
  schedules: Schedule[]
  loading: boolean
}

export function AllTasksTab({ schedules, loading }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [groupMode, setGroupMode] = useState<GroupMode>('date')

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">No tasks yet</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Add appliances to start tracking their maintenance.</p>
      </div>
    )
  }

  const counts: Record<StatusFilter, number> = {
    all: schedules.length,
    overdue: schedules.filter(s => daysUntilDue(s.nextDueAt) < 0).length,
    soon: schedules.filter(s => { const d = daysUntilDue(s.nextDueAt); return d >= 0 && d <= 7 }).length,
    upcoming: schedules.filter(s => daysUntilDue(s.nextDueAt) > 7).length,
  }

  const filtered = schedules
    .filter(s => {
      const d = daysUntilDue(s.nextDueAt)
      if (filter === 'overdue') return d < 0
      if (filter === 'soon') return d >= 0 && d <= 7
      if (filter === 'upcoming') return d > 7
      return true
    })
    .sort((a, b) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime())

  const filterLabels: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'soon', label: 'Due Soon' },
    { key: 'upcoming', label: 'Upcoming' },
  ]

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`ml-1 ${filter === key ? 'opacity-80' : 'text-slate-400 dark:text-slate-500'}`}>
                  ({counts[key]})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setGroupMode('date')}
            title="Sort by due date"
            className={`p-1.5 rounded-md transition-colors ${
              groupMode === 'date'
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <LayoutList size={15} />
          </button>
          <button
            onClick={() => setGroupMode('appliance')}
            title="Group by appliance"
            className={`p-1.5 rounded-md transition-colors ${
              groupMode === 'appliance'
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Layers size={15} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
          No tasks match this filter.
        </div>
      ) : groupMode === 'date' ? (
        <div className="flex flex-col gap-2">
          {filtered.map(s => <TaskRow key={s._id} schedule={s} />)}
        </div>
      ) : (
        <GroupedView schedules={filtered} />
      )}
    </div>
  )
}

function GroupedView({ schedules }: { schedules: Schedule[] }) {
  const groups = schedules.reduce<Record<string, { name: string; items: Schedule[] }>>((acc, s) => {
    const id = s.applianceId
    const name = s.appliance?.name ?? 'Unknown appliance'
    if (!acc[id]) acc[id] = { name, items: [] }
    acc[id].items.push(s)
    return acc
  }, {})

  const sorted = Object.entries(groups).sort(([, a], [, b]) => a.name.localeCompare(b.name))

  return (
    <div className="flex flex-col gap-6">
      {sorted.map(([applianceId, { name, items }]) => (
        <div key={applianceId}>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{name}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">({items.length})</span>
          </div>
          <div className="flex flex-col gap-2">
            {items.map(s => <TaskRow key={s._id} schedule={s} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
