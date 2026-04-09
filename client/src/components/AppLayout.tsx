import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { api } from '../lib/api'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const menuRef = useRef<HTMLDivElement>(null)
  const { isMobile, canInstall, isIOS, isInstalled, triggerPrompt } = useInstallPrompt()

  async function handleSendFeedback() {
    if (!feedbackText.trim()) return
    setFeedbackStatus('sending')
    try {
      await api.post('/api/feedback', { message: feedbackText })
      setFeedbackStatus('sent')
      setFeedbackText('')
    } catch {
      setFeedbackStatus('error')
    }
  }

  function openFeedback() {
    setMenuOpen(false)
    setFeedbackStatus('idle')
    setFeedbackText('')
    setFeedbackOpen(true)
  }

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!menuOpen) return
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen])

  const initials = user?.name ? getInitials(user.name) : '?'

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-slate-800 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-green-400 tracking-tight">
            HomeWise
          </Link>

          <div className="flex items-center gap-3">
          {/* Install button — mobile only, hidden once installed */}
          {!isInstalled && isMobile && (
            <div className="md:hidden relative">
              <button
                onClick={() => canInstall ? triggerPrompt() : setShowIOSInstructions((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-400 text-white rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Install App
              </button>

              {showIOSInstructions && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50">
                  <p className="text-sm font-medium text-slate-800 mb-2">Add to Home Screen</p>
                  {isIOS ? (
                    <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
                      <li>Tap the <strong>Share</strong> button <span className="text-base">⎙</span> at the bottom of Safari</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong></li>
                    </ol>
                  ) : (
                    <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
                      <li>Tap the <strong>⋮</strong> menu in your browser</li>
                      <li>Tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong></li>
                    </ol>
                  )}
                  <button
                    onClick={() => setShowIOSInstructions(false)}
                    className="mt-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-green-500 text-white text-sm font-semibold flex items-center justify-center hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              aria-label="Open user menu"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  History
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Profile
                </Link>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={openFeedback}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Send Feedback
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      {/* Feedback modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            {feedbackStatus === 'sent' ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">Thanks!</p>
                <p className="text-slate-500 text-sm mb-6">Your feedback has been sent.</p>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-800">Send Feedback</h2>
                  <button onClick={() => setFeedbackOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={5}
                  placeholder="What's on your mind? Bug reports, feature ideas, anything..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  autoFocus
                />
                {feedbackStatus === 'error' && (
                  <p className="text-red-500 text-xs mt-1">Something went wrong — please try again.</p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setFeedbackOpen(false)}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFeedback}
                    disabled={!feedbackText.trim() || feedbackStatus === 'sending'}
                    className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {feedbackStatus === 'sending' ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
