import { useState, FormEvent } from 'react'
import { X, ChevronLeft, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ApplianceTypePicker } from './ApplianceTypePicker'
import type { ApplianceType, Appliance } from '../types/appliance'
import { appliancesApi } from '../lib/appliances'

interface Props {
  onClose: () => void
  onCreated: (appliance: Appliance) => void
}

export function AddApplianceModal({ onClose, onCreated }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<ApplianceType | null>(null)
  const [createdAppliance, setCreatedAppliance] = useState<Appliance | null>(null)
  const [form, setForm] = useState({ name: '', brand: '', model: '', installYear: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleTypeSelect(type: ApplianceType) {
    setSelectedType(type)
    setForm((f) => ({ ...f, name: type.label }))
    setStep(2)
  }

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedType) return
    setError('')
    setLoading(true)
    try {
      const appliance = await appliancesApi.create({
        typeId: selectedType._id,
        name: form.name,
        brand: form.brand || undefined,
        model: form.model || undefined,
        installYear: form.installYear ? parseInt(form.installYear) : undefined,
        notes: form.notes || undefined,
      })
      onCreated(appliance)
      setCreatedAppliance(appliance)

      // Suggest catch-up review if install year is more than a year ago
      const installYear = form.installYear ? parseInt(form.installYear) : null
      const isOld = installYear && installYear < new Date().getFullYear() - 1
      if (isOld) {
        setStep(3)
      } else {
        onClose()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add appliance')
    } finally {
      setLoading(false)
    }
  }

  function handleReviewTasks() {
    onClose()
    if (createdAppliance) navigate(`/appliances/${createdAppliance._id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="font-semibold text-slate-800">
              {step === 1 ? 'What type of appliance?' : step === 2 ? 'Appliance details' : 'Appliance added'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {step === 1 && <ApplianceTypePicker onSelect={handleTypeSelect} />}

          {step === 2 && (
            <form id="appliance-form" onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="e.g. Carrier"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={set('model')}
                    placeholder="e.g. 58CVA"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Install Year</label>
                <input
                  type="number"
                  value={form.installYear}
                  onChange={set('installYear')}
                  min={1950}
                  max={new Date().getFullYear()}
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
                  placeholder="Anything useful to remember…"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="py-4 flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 mb-1">{createdAppliance?.name} added!</p>
                <p className="text-sm text-slate-500">
                  Since this appliance has been installed for a while, some maintenance tasks may already be overdue.
                </p>
              </div>
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-sm font-medium text-amber-800 mb-1">Want to get caught up?</p>
                <p className="text-xs text-amber-700">
                  Review your tasks and use "Schedule for this week" to add any you'd like to tackle soon. Completely optional — your tasks are already scheduled based on the install year.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <button
              type="submit"
              form="appliance-form"
              disabled={loading}
              className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding…' : 'Add Appliance'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleReviewTasks}
              className="flex-1 bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Review Tasks →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
