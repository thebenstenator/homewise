import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Pencil, Trash2, ChevronLeft, Home } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { EditApplianceModal } from '../components/EditApplianceModal'
import { appliancesApi, Appliance } from '../lib/appliances'

export function ApplianceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [appliance, setAppliance] = useState<Appliance | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    appliancesApi
      .getAll()
      .then((all) => setAppliance(all.find((a) => a._id === id) ?? null))
      .finally(() => setLoading(false))
  }, [id])

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

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Home size={24} className="text-green-600" />
            </div>
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

        {(appliance.brand || appliance.model || appliance.installYear) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
            {appliance.brand && <span><span className="text-slate-400">Brand</span> {appliance.brand}</span>}
            {appliance.model && <span><span className="text-slate-400">Model</span> {appliance.model}</span>}
            {appliance.installYear && <span><span className="text-slate-400">Installed</span> {appliance.installYear}</span>}
          </div>
        )}

        {appliance.notes && (
          <p className="mt-3 text-sm text-slate-500 border-t border-slate-100 pt-3">{appliance.notes}</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Maintenance Tasks</h2>
        <p className="text-sm text-slate-400">Maintenance schedule will appear here in the next update.</p>
      </div>

      {editing && (
        <EditApplianceModal
          appliance={appliance}
          onClose={() => setEditing(false)}
          onUpdated={(updated) => { setAppliance(updated); setEditing(false) }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-slate-800 mb-2">Delete "{appliance.name}"?</h3>
            <p className="text-sm text-slate-500 mb-5">This will also remove its maintenance history. This can't be undone.</p>
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
