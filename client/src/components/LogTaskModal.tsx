import { useState, FormEvent } from 'react'
import { X } from 'lucide-react'
import type { Schedule } from '../types/appliance'
import { schedulesApi } from '../lib/schedules'

interface Props {
  schedule: Schedule
  onClose: () => void
  onCompleted: (updated: Schedule) => void
}

export function LogTaskModal({ schedule, onClose, onCompleted }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    completedAt: today,
    doneBy: 'self' as 'self' | 'pro',
    notes: '',
    cost: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const updated = await schedulesApi.complete(schedule._id, {
        doneBy: form.doneBy,
        completedAt: form.completedAt,
        notes: form.notes || undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      })
      onCompleted(updated)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Mark Task Done</h2>
            <p className="text-xs text-slate-500 mt-0.5">{schedule.task?.label}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date Completed</label>
            <input
              type="date"
              value={form.completedAt}
              onChange={set('completedAt')}
              max={today}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Done by</label>
            <div className="flex gap-3">
              {(['self', 'pro'] as const).map((v) => (
                <label
                  key={v}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors ${
                    form.doneBy === v
                      ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="doneBy"
                    value={v}
                    checked={form.doneBy === v}
                    onChange={set('doneBy')}
                    className="sr-only"
                  />
                  {v === 'self' ? 'I did it myself' : 'Hired a professional'}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cost <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                value={form.cost}
                onChange={set('cost')}
                min={0}
                step={0.01}
                placeholder="0.00"
                className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={set('notes')}
              rows={2}
              placeholder="Anything worth remembering…"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving…' : 'Mark as Done'}
          </button>
        </form>
      </div>
    </div>
  )
}
