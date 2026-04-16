import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Plus, Layers } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { ApplianceCard } from '../components/ApplianceCard'
import { AddApplianceModal } from '../components/AddApplianceModal'
import { EditApplianceModal } from '../components/EditApplianceModal'
import { QuickAddModal } from '../components/QuickAddModal'
import { TaskCard } from '../components/TaskCard'
import { HomeHealthScore } from '../components/HomeHealthScore'
import type { Appliance, Schedule, HomeHealthStats } from '../types/appliance'
import { appliancesApi } from '../lib/appliances'
import { schedulesApi } from '../lib/schedules'
import { historyApi } from '../lib/history'

type Tab = 'due' | 'appliances'

export function DashboardPage() {
  const location = useLocation()
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [stats, setStats] = useState<HomeHealthStats | null>(null)
  const [loadingAppliances, setLoadingAppliances] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [tab, setTab] = useState<Tab>((location.state as { tab?: Tab })?.tab ?? 'due')
  const [showAdd, setShowAdd] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [editing, setEditing] = useState<Appliance | null>(null)

  function refreshStats() {
    historyApi.getStats().then(setStats).catch(() => setStats(null))
  }

  useEffect(() => {
    appliancesApi.getAll().then(setAppliances).finally(() => setLoadingAppliances(false))
    schedulesApi.getDue().then(setSchedules).finally(() => setLoadingSchedules(false))
    historyApi.getStats().then(setStats).finally(() => setLoadingStats(false))
  }, [])

  function handleCreated(appliance: Appliance) {
    setAppliances((prev) => [appliance, ...prev])
    setShowAdd(false)
    setTab('appliances')
    schedulesApi.getDue().then(setSchedules)
    refreshStats()
  }

  function handleQuickAddCreated(newAppliances: Appliance[]) {
    setAppliances((prev) => [...newAppliances, ...prev])
    setShowQuickAdd(false)
    setTab('appliances')
    schedulesApi.getDue().then(setSchedules)
    refreshStats()
  }

  function handleUpdated(appliance: Appliance) {
    setAppliances((prev) => prev.map((a) => (a._id === appliance._id ? appliance : a)))
    setEditing(null)
  }

  async function handleDelete(id: string) {
    await appliancesApi.remove(id)
    setAppliances((prev) => prev.filter((a) => a._id !== id))
    setSchedules((prev) => prev.filter((s) => s.applianceId !== id))
    refreshStats()
  }

  function handleScheduleUpdated(updated: Schedule) {
    const in30Days = Date.now() + 7 * 24 * 60 * 60 * 1000
    const stillDue = new Date(updated.nextDueAt).getTime() <= in30Days
    setSchedules((prev) =>
      stillDue
        ? prev.map((s) => (s._id === updated._id ? updated : s))
        : prev.filter((s) => s._id !== updated._id)
    )
    refreshStats()
  }

  const dueCount = schedules.length
  const dueCountByAppliance = schedules.reduce<Record<string, number>>((acc, s) => {
    acc[s.applianceId] = (acc[s.applianceId] ?? 0) + 1
    return acc
  }, {})

  return (
    <AppLayout>
      {/* Health score */}
      <HomeHealthScore stats={stats} loading={loadingStats} />

      {/* Stat bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setTab('appliances')}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-slate-800">{stats.totalAppliances}</div>
            <div className="text-xs text-slate-500 mt-0.5">Appliances</div>
          </button>
          <button
            onClick={() => setTab('due')}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-slate-800">{stats.overdueCount + stats.dueSoonCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Tasks Due</div>
          </button>
          <Link
            to="/history"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-center hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer"
          >
            <div className="text-2xl font-bold text-slate-800">{stats.completedLast30}</div>
            <div className="text-xs text-slate-500 mt-0.5">Done This Month</div>
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setTab('due')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'due' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Due Soon
            {dueCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                {dueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('appliances')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'appliances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Appliances
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 border border-green-600 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
          >
            <Layers size={16} /> Quick Add
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={16} /> Add Appliance
          </button>
        </div>
      </div>

      {/* Due Soon tab */}
      {tab === 'due' && (
        <>
          {loadingSchedules ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">You're all caught up!</h2>
              <p className="text-slate-500 text-sm">No maintenance tasks due in the next 30 days.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((schedule) => (
                <TaskCard
                  key={schedule._id}
                  schedule={schedule}
                  onUpdated={handleScheduleUpdated}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* All Appliances tab */}
      {tab === 'appliances' && (
        <>
          {loadingAppliances ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appliances.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">No appliances yet</h2>
              <p className="text-slate-500 mb-6 text-sm">Add your first appliance to start tracking maintenance.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Add your first appliance
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {appliances.map((appliance) => (
                <div key={appliance._id} className="relative">
                  <ApplianceCard
                    appliance={appliance}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    dueCount={dueCountByAppliance[appliance._id] ?? 0}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showAdd && <AddApplianceModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />}
      {showQuickAdd && (
        <QuickAddModal
          ownedTypeIds={appliances.map((a) => a.typeId)}
          onClose={() => setShowQuickAdd(false)}
          onCreated={handleQuickAddCreated}
        />
      )}
      {editing && (
        <EditApplianceModal
          appliance={editing}
          onClose={() => setEditing(null)}
          onUpdated={handleUpdated}
        />
      )}
    </AppLayout>
  )
}
