import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

export function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('This unsubscribe link is invalid.')
      return
    }

    api.get<{ message: string }>(`/api/auth/unsubscribe?token=${token}`)
      .then((data) => {
        setStatus('success')
        setMessage(data.message)
      })
      .catch(() => {
        setStatus('error')
        setMessage('This unsubscribe link is invalid or has already been used.')
      })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="text-xl font-bold text-green-600 tracking-tight block mb-8">
          HomeWise
        </Link>

        {status === 'loading' && (
          <p className="text-slate-500 text-sm">Processing your request…</p>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">You're unsubscribed</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <p className="text-xs text-slate-400">
              Changed your mind?{' '}
              <Link to="/profile" className="text-green-600 hover:underline">
                Re-enable reminders in your profile
              </Link>
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid link</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link to="/profile" className="text-green-600 text-sm hover:underline">
              Manage preferences in your profile
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
