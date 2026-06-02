import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Leaf, Snowflake, Sprout, ChevronDown, ChevronUp, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Appliance, Schedule } from '../types/appliance'
import { schedulesApi } from '../lib/schedules'
import {
  getCurrentSeason,
  getSeasonStart,
  getSeasonalTasksForUser,
  type Season,
} from '../lib/seasonalTasks'

const seasonConfig: Record<Season, {
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  iconClass: string
  borderClass: string
  bgClass: string
  headingClass: string
}> = {
  spring: {
    label: 'Spring',
    Icon: Sprout,
    iconClass: 'text-green-600',
    borderClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    headingClass: 'text-green-800 dark:text-green-300',
  },
  summer: {
    label: 'Summer',
    Icon: Sun,
    iconClass: 'text-yellow-500',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
    headingClass: 'text-yellow-800 dark:text-yellow-300',
  },
  fall: {
    label: 'Fall',
    Icon: Leaf,
    iconClass: 'text-orange-500',
    borderClass: 'border-orange-200 dark:border-orange-800',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20',
    headingClass: 'text-orange-800 dark:text-orange-300',
  },
  winter: {
    label: 'Winter',
    Icon: Snowflake,
    iconClass: 'text-blue-500',
    borderClass: 'border-blue-200 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    headingClass: 'text-blue-800 dark:text-blue-300',
  },
}

interface Props {
  appliances: Appliance[]
  schedules: Schedule[]
  onCompleted: () => void
}

export function SeasonalChecklist({ appliances, schedules, onCompleted }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [sessionChecked, setSessionChecked] = useState<Set<string>>(new Set())
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  const season = getCurrentSeason()
  const tasks = getSeasonalTasksForUser(season, appliances)
  const seasonStart = getSeasonStart(season)

  // Tasks completed this season according to lastCompletedAt on the schedule
  const alreadyDone = useMemo(() => {
    const set = new Set<string>()
    for (const task of tasks) {
      const schedule = schedules.find(
        (s) => s.applianceId === task.applianceId && s.taskId === task.taskId
      )
      if (schedule?.lastCompletedAt && new Date(schedule.lastCompletedAt) >= seasonStart) {
        set.add(`${task.applianceId}-${task.taskId}`)
      }
    }
    return set
  }, [tasks, schedules, seasonStart])

  // Combine persisted (server) + session (optimistic) checked state
  const checked = useMemo(
    () => new Set([...alreadyDone, ...sessionChecked]),
    [alreadyDone, sessionChecked]
  )

  if (tasks.length === 0) return null

  const { label, Icon, iconClass, borderClass, bgClass, headingClass } = seasonConfig[season]

  async function handleCheck(applianceId: string, taskId: string) {
    const key = `${applianceId}-${taskId}`
    if (checked.has(key) || completing.has(key)) return

    const schedule = schedules.find(
      (s) => s.applianceId === applianceId && s.taskId === taskId
    )
    if (!schedule) {
      // No schedule found — navigate to appliance page instead
      return
    }

    setCompleting((prev) => new Set(prev).add(key))
    try {
      await schedulesApi.complete(schedule._id, {
        doneBy: 'self',
        completedAt: new Date().toISOString().split('T')[0],
      })
      setSessionChecked((prev) => new Set(prev).add(key))
      onCompleted()
    } catch {
      toast.error('Could not mark task complete. Try again.')
    } finally {
      setCompleting((prev) => { const next = new Set(prev); next.delete(key); return next })
    }
  }

  const doneCount = checked.size

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} mb-6`}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconClass} />
          <span className={`text-sm font-semibold ${headingClass}`}>
            {label} Tasks
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {doneCount > 0
              ? `${doneCount} of ${tasks.length} done`
              : `${tasks.length} for your appliances`}
          </span>
        </div>
        {collapsed
          ? <ChevronDown size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
          : <ChevronUp size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
        }
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {tasks.map((task) => {
            const key = `${task.applianceId}-${task.taskId}`
            const isDone = checked.has(key)
            const isLoading = completing.has(key)
            const hasSchedule = schedules.some(
              (s) => s.applianceId === task.applianceId && s.taskId === task.taskId
            )

            return (
              <div
                key={key}
                className={`flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-3 py-2.5 border transition-all ${
                  isDone
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                    : 'border-white dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm dark:hover:shadow-none'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleCheck(task.applianceId, task.taskId)}
                  disabled={isDone || isLoading || !hasSchedule}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-green-600 border-green-600'
                      : isLoading
                      ? 'border-slate-300 dark:border-slate-600 opacity-50'
                      : hasSchedule
                      ? 'border-slate-300 dark:border-slate-600 hover:border-green-500'
                      : 'border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                  title={!hasSchedule ? 'No schedule found for this task' : undefined}
                >
                  {isDone && <Check size={12} strokeWidth={3} className="text-white" />}
                  {isLoading && (
                    <div className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {task.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{task.applianceName}</p>
                </div>

                {/* Detail link */}
                <Link
                  to={`/appliances/${task.applianceId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors shrink-0"
                  title="View appliance"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
