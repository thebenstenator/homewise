import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-slate-800 text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-green-400 tracking-tight">
            HomeWise
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
