import { useState, useEffect } from 'react'
import { Clock, CheckCircle, ChevronDown, X, CalendarClock, BookOpen, Bell, BellOff, SkipForward, Settings } from 'lucide-react'
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
  autoOpenDiy?: boolean
}

export function TaskCard({ schedule, onUpdated, showInterval = false, autoOpenDiy = false }: Props) {
  const { user } = useAuth()
  const [showLog, setShowLog] = useState(false)
  const [showPro, setShowPro] = useState(false)
  const [showDiy, setShowDiy] = useState(autoOpenDiy)
  const [showSnooze, setShowSnooze] = useState(false)
  const [snoozing, setSnoozing] = useState(false)
  const [schedulingNow, setSchedulingNow] = useState(false)
  const [editingInterval, setEditingInterval] = useState(false)
  const [intervalValue, setIntervalValue] = useState(schedule.intervalDays.toString())
  const [togglingReminder, setTogglingReminder] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notesValue, setNotesValue] = useState(schedule.customNotes ?? '')
  const [savingSettings, setSavingSettings] = useState(false)

  const days = daysUntilDue(schedule.nextDueAt)
  const isOverdue = days < 0
  const isDueSoon = days <= 7
  const isSnoozed = schedule.snoozedUntil && new Date(schedule.snoozedUntil) > new Date()

  const urgencyColor = isOverdue
    ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
    : days <= 7
    ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800'
    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'

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

  async function handleToggleReminder() {
    setTogglingReminder(true)
    try {
      const updated = await schedulesApi.toggleReminders(schedule._id)
      onUpdated(updated)
      toast.success(updated.remindersEnabled ? 'Reminders turned on' : 'Reminders turned off')
    } catch {
      toast.error('Failed to update reminder setting')
    } finally {
      setTogglingReminder(false)
    }
  }

  async function handleSaveSettings() {
    setSavingSettings(true)
    try {
      const updated = await schedulesApi.updateSettings(schedule._id, {
        customNotes: notesValue.trim() || undefined,
      })
      onUpdated(updated)
      setShowSettings(false)
      toast.success('Task notes saved')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleDisableTask() {
    setSavingSettings(true)
    try {
      const updated = await schedulesApi.updateSettings(schedule._id, { isActive: false })
      onUpdated(updated)
      setShowSettings(false)
      toast.success('Task disabled')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable task')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSkip() {
    setSkipping(true)
    try {
      const updated = await schedulesApi.skip(schedule._id)
      onUpdated(updated)
      toast.success(`Skipped — next reminder in ${schedule.intervalDays} days`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to skip')
    } finally {
      setSkipping(false)
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
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{schedule.appliance?.name}</p>
            <p className="font-medium text-slate-800 dark:text-slate-100 leading-tight mt-0.5">
              {schedule.task?.label ?? schedule.taskId}
            </p>
            {schedule.task?.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{schedule.task.notes}</p>
            )}
            {schedule.customNotes && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed italic">Note: {schedule.customNotes}</p>
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
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen size={13} /> DIY Guide
            </button>
          )}

          <button
            onClick={() => setShowPro(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Find a Pro
          </button>

          {showInterval && !isDueSoon && (
            <button
              onClick={handleScheduleNow}
              disabled={schedulingNow}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CalendarClock size={13} /> Schedule for this week
            </button>
          )}

          {isDueSoon && (
            <div className="relative">
              <button
                disabled={snoozing}
                onClick={() => setShowSnooze((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Clock size={13} /> Snooze <ChevronDown size={11} />
              </button>
              {showSnooze && (
                <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg dark:shadow-none z-10 min-w-[110px]">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => handleSnooze(d)}
                      className="block w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {d === 7 ? '1 week' : d === 14 ? '2 weeks' : '1 month'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSkip}
            disabled={skipping}
            title="Skip this interval — advances the due date by one full cycle without logging completion"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <SkipForward size={13} /> Skip
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleReminder}
              disabled={togglingReminder}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                schedule.remindersEnabled ?? true
                  ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40'
                  : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              }`}
            >
              {schedule.remindersEnabled ?? true
                ? <><Bell size={12} /> Reminders on</>
                : <><BellOff size={12} /> Reminders off</>
              }
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 px-1.5 py-1.5 rounded-lg transition-colors"
              title="Task settings"
            >
              <Settings size={13} />
            </button>
          </div>

          {showInterval && (
            <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Every</span>
            {editingInterval ? (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                  className="w-16 border border-slate-300 dark:border-slate-600 rounded px-2 py-0.5 text-xs dark:bg-slate-700 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">days</span>
                <button onClick={handleSaveInterval} className="text-xs text-green-600 font-medium">Save</button>
                <button onClick={() => setEditingInterval(false)} className="text-xs text-slate-400 dark:text-slate-500">Cancel</button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{schedule.intervalDays} days</span>
                <button
                  onClick={() => setEditingInterval(true)}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Adjust
                </button>
              </>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Find a Pro popover */}
      {showPro && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPro(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Find a Pro</h3>
              <button onClick={() => setShowPro(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
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
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Search on Angi →
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 text-center">
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

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Task Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium uppercase tracking-wide">{schedule.task?.label ?? schedule.taskId}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Personal note</label>
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="e.g. Use the 20x20x1 Filtrete filter from the utility closet"
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 resize-none"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{notesValue.length}/500</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Save note
              </button>
              <button
                onClick={handleDisableTask}
                disabled={savingSettings}
                className="w-full px-4 py-2.5 border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                Disable this task
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">Disabled tasks can be re-enabled from the appliance page</p>
          </div>
        </div>
      )}
    </>
  )
}
