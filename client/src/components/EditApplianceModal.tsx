import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Appliance } from '../types/appliance'
import { appliancesApi } from '../lib/appliances'
import { useModalClose } from '../hooks/useModalClose'

interface Props {
  appliance: Appliance
  onClose: () => void
  onUpdated: (appliance: Appliance) => void
}

export function EditApplianceModal({ appliance, onClose, onUpdated }: Props) {
  useModalClose(onClose)
  const [form, setForm] = useState({
    name: appliance.name,
    brand: appliance.brand ?? '',
    model: appliance.model ?? '',
    installYear: appliance.installYear?.toString() ?? '',
    notes: appliance.notes ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (form.installYear) {
      const year = parseInt(form.installYear)
      const currentYear = new Date().getFullYear()
      if (form.installYear.length !== 4 || isNaN(year) || year < 1950 || year > currentYear) {
        setError(`Install year must be between 1950 and ${currentYear}`)
        return
      }
    }
    setLoading(true)
    try {
      const updated = await appliancesApi.update(appliance._id, {
        name: form.name,
        brand: form.brand || undefined,
        model: form.model || undefined,
        installYear: form.installYear ? parseInt(form.installYear) : undefined,
        notes: form.notes || undefined,
      })
      onUpdated(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update appliance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Edit Appliance</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={set('brand')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={set('model')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Install Year</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.installYear}
              onChange={set('installYear')}
              maxLength={4}
              placeholder="e.g. 2018"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
