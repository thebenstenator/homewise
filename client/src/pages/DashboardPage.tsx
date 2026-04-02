import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { ApplianceCard } from '../components/ApplianceCard'
import { AddApplianceModal } from '../components/AddApplianceModal'
import { EditApplianceModal } from '../components/EditApplianceModal'
import { appliancesApi, Appliance } from '../lib/appliances'

export function DashboardPage() {
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Appliance | null>(null)

  useEffect(() => {
    appliancesApi
      .getAll()
      .then(setAppliances)
      .finally(() => setLoading(false))
  }, [])

  function handleCreated(appliance: Appliance) {
    setAppliances((prev) => [appliance, ...prev])
    setShowAdd(false)
  }

  function handleUpdated(appliance: Appliance) {
    setAppliances((prev) => prev.map((a) => (a._id === appliance._id ? appliance : a)))
    setEditing(null)
  }

  async function handleDelete(id: string) {
    await appliancesApi.remove(id)
    setAppliances((prev) => prev.filter((a) => a._id !== id))
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Appliances</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Add Appliance
        </button>
      </div>

      {loading ? (
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
              />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddApplianceModal onClose={() => setShowAdd(false)} onCreated={handleCreated} />
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
