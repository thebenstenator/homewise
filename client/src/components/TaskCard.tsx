import { useState, useEffect } from 'react'
import { Clock, CheckCircle, ChevronDown, X, CalendarClock, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Schedule } from '../types/appliance'
import { schedulesApi, daysUntilDue } from '../lib/schedules'
import { thumbtackUrl, angiUrl, openAffiliate } from '../lib/affiliateLinks'
import { useAuth } from '../context/AuthContext'
import { LogTaskModal } from './LogTaskModal'
import { DiyGuideModal } from './DiyGuideModal'

interface Props {
  schedule: Schedule
  onUpdated: (schedule: Schedule) => void
  showInterval?: boolean
}

export function TaskCard({ schedule, onUpdated, showInterval = false }: Props) {
  const { user } = useAuth()
  const [showLog, setShowLog] = useState(false)
  const [showPro, setShowPro] = useState(false)
  const [showDiy, setShowDiy] = useState(false)
  const [showSnooze, setShowSnooze] = useState(false)
  const [snoozing, setSnoozing] = useState(false)
  const [schedulingNow, setSchedulingNow] = useState(false)
  const [editingInterval, setEditingInterval] = useState(false)
  const [intervalValue, setIntervalValue] = useState(schedule.intervalDays.toString())

  const days = daysUntilDue(schedule.nextDueAt)
  const isOverdue = days < 0
  const isDueSoon = days <= 7
  const isSnoozed = schedule.snoozedUntil && new Date(schedule.snoozedUntil) > new Date()

  const urgencyColor = isOverdue
    ? 'border-red-200 bg-red-50'
    : days <= 7
    ? 'border-amber-200 bg-amber-50'
    : 'border-slate-200 bg-white'

  const badgeColor = isOverdue
    ? 'bg-red-100 text-red-700'
    : days <= 7
    ? 'bg-amber-100 text-amber-700'
    : 'bg-green-100 text-green-700'

  const dueLabel = isOverdue
    ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
    : days === 0
    ? 'Due today'
    : `Due in ${days} day${days !== 1 ? 's' : ''}`

  async function handleSnooze(d: number) {
    setSnoozing(true)
    setShowSnooze(false)
    try {
      const updated = await schedulesApi.snooze(schedule._id, d)
      onUpdated(updated)
      const label = d === 7 ? '1 week' : d === 14 ? '2 weeks' : '1 month'
      toast.success(`Snoozed for ${label}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to snooze')
    } finally {
      setSnoozing(false)
    }
  }

  async function handleScheduleNow() {
    setSchedulingNow(true)
    try {
      const updated = await schedulesApi.scheduleNow(schedule._id)
      onUpdated(updated)
    } finally {
      setSchedulingNow(false)
    }
  }

  async function handleSaveInterval() {
    const val = parseInt(intervalValue)
    if (!val || val < 1) return
    const updated = await schedulesApi.updateInterval(schedule._id, val)
    onUpdated(updated)
    setEditingInterval(false)
  }

  useEffect(() => {
    if (!showPro && !showDiy && !showLog) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowPro(false)
        setShowDiy(false)
        setShowLog(false)
        setShowSnooze(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showPro, showDiy, showLog])

  if (isSnoozed) return null

  return (
    <>
      <div className={`border rounded-xl p-4 ${urgencyColor}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 truncate">{schedule.appliance?.name}</p>
            <p className="font-medium text-slate-800 leading-tight mt-0.5">
              {schedule.task?.label ?? schedule.taskId}
            </p>
            {schedule.task?.notes && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{schedule.task.notes}</p>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${badgeColor}`}>
            {dueLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setShowLog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={13} /> Mark Done
          </button>

          {schedule.task?.diyUrl && (
            <button
              onClick={() => setShowDiy(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <BookOpen size={13} /> DIY Guide
            </button>
          )}

          <button
            onClick={() => setShowPro(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Find a Pro
          </button>

          {showInterval && !isDueSoon && (
            <button
              onClick={handleScheduleNow}
              disabled={schedulingNow}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 text-amber-700 bg-amber-50 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CalendarClock size={13} /> Schedule for this week
            </button>
          )}

          {isDueSoon && (
            <div className="relative">
              <button
                disabled={snoozing}
                onClick={() => setShowSnooze((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Clock size={13} /> Snooze <ChevronDown size={11} />
              </button>
              {showSnooze && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[110px]">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSnooze(d)}
                      className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {d === 7 ? '1 week' : d === 14 ? '2 weeks' : '1 month'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showInterval && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
            <span className="text-xs text-slate-500">Every</span>
            {editingInterval ? (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="w-16 border border-slate-300 rounded px-2 py-0.5 text-xs"
                />
                <span className="text-xs text-slate-500">days</span>
                <button onClick={handleSaveInterval} className="text-xs text-green-600 font-medium">Save</button>
                <button onClick={() => setEditingInterval(false)} className="text-xs text-slate-400">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-slate-700">{schedule.intervalDays} days</span>
                <button
                  onClick={() => setEditingInterval(true)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Adjust
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Find a Pro popover */}
      {showPro && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPro(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Find a Pro</h3>
              <button onClick={() => setShowPro(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Find a local professional for: <strong>{schedule.task?.label}</strong>
            </p>
            {!user?.zipCode && (
              <p className="text-xs text-amber-600 mb-3">Update your zip code in Profile to get local results.</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  openAffiliate(thumbtackUrl(schedule.task?.thumbtackCategory ?? '', user?.zipCode ?? ''), 'thumbtack')
                  setShowPro(false)
                }}
                className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Search on Thumbtack →
              </button>
              <button
                onClick={() => {
                  openAffiliate(angiUrl(schedule.task?.angiCategory ?? '', user?.zipCode ?? ''), 'angi')
                  setShowPro(false)
                }}
                className="w-full px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Search on Angi →
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              HomeWise may earn a referral fee at no additional cost to you.
            </p>
          </div>
        </div>
      )}

      {showDiy && schedule.task && (
        <DiyGuideModal
          task={schedule.task}
          applianceName={schedule.appliance?.name ?? ''}
          onClose={() => setShowDiy(false)}
        />
      )}

      {showLog && (
        <LogTaskModal
          schedule={schedule}
          onClose={() => setShowLog(false)}
          onCompleted={onUpdated}
        />
      )}
    </>
  )
}
