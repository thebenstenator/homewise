import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    zipCode: user?.zipCode ?? '',
    emailReminders: user?.emailReminders ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)
    try {
      const { user: updated } = await api.put<{ user: typeof user }>('/api/users/profile', form)
      setUser(updated)
      setSuccess(true)
      toast.success('Profile saved!')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Profile</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4 dark:shadow-none">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg">Profile saved.</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              required
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Email address cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Zip Code</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={set('zipCode')}
              pattern="\d{5}"
              maxLength={5}
              placeholder="e.g. 90210"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Used to find pros near you.</p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Weekly maintenance reminders</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Sent every Monday morning</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, emailReminders: !f.emailReminders }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.emailReminders ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.emailReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
