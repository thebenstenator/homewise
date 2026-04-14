import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Pencil, Trash2, ChevronLeft, Home } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { EditApplianceModal } from '../components/EditApplianceModal'
import { TaskCard } from '../components/TaskCard'
import type { Appliance, Schedule, MaintenanceLog } from '../types/appliance'
import { appliancesApi } from '../lib/appliances'
import { schedulesApi } from '../lib/schedules'
import { historyApi } from '../lib/history'

type DetailTab = 'tasks' | 'history'

export function ApplianceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const autoOpenDiyTaskId = searchParams.get('diy')
  const [appliance, setAppliance] = useState<Appliance | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [tab, setTab] = useState<DetailTab>('tasks')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)

  useEffect(() => {
    Promise.all([appliancesApi.getAll(), schedulesApi.getAll()])
      .then(([all, allSchedules]) => {
        setAppliance(all.find((a) => a._id === id) ?? null)
        setSchedules(allSchedules.filter((s) => s.applianceId === id))
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (tab !== 'history' || !id) return
    setLoadingLogs(true)
    historyApi.getAll(id).then(setLogs).finally(() => setLoadingLogs(false))
  }, [tab, id])

  function handleScheduleUpdated(updated: Schedule) {
    setSchedules((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
  }

  async function handleDelete() {
    if (!appliance) return
    await appliancesApi.remove(appliance._id)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!appliance) {
    return (
      <AppLayout>
        <p className="text-slate-500">Appliance not found.</p>
        <Link to="/dashboard" className="text-green-600 text-sm mt-2 inline-block">← Back to Dashboard</Link>
      </AppLayout>
    )
  }

  const type = appliance.applianceType

  return (
    <AppLayout>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {appliance.photoUrl ? (
              <button onClick={() => setPhotoOpen(true)} className="shrink-0 focus:outline-none">
                <img
                  src={appliance.photoUrl}
                  alt={appliance.name}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                />
              </button>
            ) : (
              <div className="p-3 bg-green-50 rounded-xl shrink-0">
                <Home size={24} className="text-green-600" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-800">{appliance.name}</h1>
              {type && <p className="text-sm text-slate-500">{type.label}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {(appliance.brand || appliance.model || appliance.serialNumber || appliance.installYear) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
            {appliance.brand && <span><span className="text-slate-400">Brand </span>{appliance.brand}</span>}
            {appliance.model && <span><span className="text-slate-400">Model </span>{appliance.model}</span>}
            {appliance.serialNumber && <span><span className="text-slate-400">Serial </span>{appliance.serialNumber}</span>}
            {appliance.installYear && <span><span className="text-slate-400">Installed </span>{appliance.installYear}</span>}
          </div>
        )}
        {appliance.notes && (
          <p className="mt-3 text-sm text-slate-500 border-t border-slate-100 pt-3">{appliance.notes}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'tasks' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Maintenance Tasks
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          History
        </button>
      </div>

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <>
          {schedules.length === 0 ? (
            <p className="text-sm text-slate-400">No maintenance tasks found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((s) => (
                <TaskCard
                  key={s._id}
                  schedule={s}
                  onUpdated={handleScheduleUpdated}
                  showInterval
                  autoOpenDiy={s.taskId === autoOpenDiyTaskId}
                />
              ))}
            </div>
          )}

          {/* Always-on reminder tips */}
          {type && type.tasks.filter((t) => t.isReminder).length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Always-On Reminders
              </h3>
              <div className="flex flex-col gap-2">
                {type.tasks.filter((t) => t.isReminder).map((t) => (
                  <div
                    key={t.taskId}
                    className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3"
                  >
                    <span className="text-amber-500 text-base mt-0.5">⚠</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.label}</p>
                      {t.notes && (
                        <p className="text-xs text-slate-500 mt-0.5">{t.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <>
          {loadingLogs ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No maintenance logged yet for this appliance.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {logs.map((log) => {
                const date = new Date(log.completedAt).toLocaleDateString('default', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                return (
                  <div
                    key={log._id}
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{log.taskLabel}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                      {log.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                )
              })}
            </div>
          )}
        </>
      )}

      {editing && (
        <EditApplianceModal
          appliance={appliance}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { setAppliance(updated); setEditing(false) }}
        />
      )}

      {photoOpen && appliance.photoUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 cursor-zoom-out"
          onClick={() => setPhotoOpen(false)}
        >
          <img
            src={appliance.photoUrl}
            alt={appliance.name}
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-slate-800 mb-2">Delete "{appliance.name}"?</h3>
            <p className="text-sm text-slate-500 mb-5">This will also remove all maintenance history. This can't be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
