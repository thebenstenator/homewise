import { useState, type FormEvent } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useModalClose } from '../hooks/useModalClose'
import { ApplianceTypePicker } from './ApplianceTypePicker'
import type { ApplianceType, Appliance } from '../types/appliance'
import { appliancesApi } from '../lib/appliances'

interface Props {
  onClose: () => void
  onCreated: (appliance: Appliance) => void
}

export function AddApplianceModal({ onClose, onCreated }: Props) {
  useModalClose(onClose)
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedType, setSelectedType] = useState<ApplianceType | null>(null)
  const [form, setForm] = useState({ name: '', brand: '', model: '', installYear: '', lastServiceDate: '', notes: '' })
  const [neverServiced, setNeverServiced] = useState(false)
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

  function validateYear(): string | null {
    if (!form.installYear) return null
    const year = parseInt(form.installYear)
    const currentYear = new Date().getFullYear()
    if (form.installYear.length !== 4 || isNaN(year) || year < 1950 || year > currentYear) {
      return `Install year must be between 1950 and ${currentYear}`
    }
    return null
  }

  async function handleSubmit(e: FormEvent, reviewAfter = false) {
    e.preventDefault()
    if (!selectedType) return
    const yearError = validateYear()
    if (yearError) { setError(yearError); return }
    setError('')
    setLoading(true)
    try {
      const appliance = await appliancesApi.create({
        typeId: selectedType._id,
        name: form.name,
        brand: form.brand || undefined,
        model: form.model || undefined,
        installYear: form.installYear ? parseInt(form.installYear) : undefined,
        lastServiceDate: (!neverServiced && form.lastServiceDate)
          ? new Date(form.lastServiceDate).toISOString()
          : undefined,
        notes: form.notes || undefined,
      })
      onCreated(appliance)
      toast.success(`${form.name} added!`)
      if (reviewAfter) {
        navigate(`/appliances/${appliance._id}`)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add appliance'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const installYear = form.installYear.length === 4 ? parseInt(form.installYear) : null
  const currentYear = new Date().getFullYear()
  const isOld = installYear !== null && installYear >= 1950 && installYear <= currentYear && installYear < currentYear - 1

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-700">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="font-semibold text-slate-800">
              {step === 1 ? 'What type of appliance?' : 'Appliance details'}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of last service</label>
                <input
                  type="date"
                  value={form.lastServiceDate}
                  onChange={set('lastServiceDate')}
                  disabled={neverServiced}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 disabled:bg-slate-50"
                />
                <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={neverServiced}
                    onChange={(e) => {
                      setNeverServiced(e.target.checked)
                      if (e.target.checked) setForm((f) => ({ ...f, lastServiceDate: '' }))
                    }}
                    className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xs text-slate-500">Never serviced / not sure</span>
                </label>
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

        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-2">
            {isOld && (
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding…' : 'Add & Review Tasks'}
              </button>
            )}
            <button
              type="submit"
              form="appliance-form"
              disabled={loading}
              className={`w-full rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 transition-colors ${
                isOld
                  ? 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? 'Adding…' : 'Add Appliance'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
