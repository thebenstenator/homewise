import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/history" className="text-sm text-slate-300 hover:text-white transition-colors">
              History
            </Link>
            <Link to="/profile" className="text-sm text-slate-300 hover:text-white transition-colors">
              {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-700 mt-3 pt-3 flex flex-col gap-1 max-w-5xl mx-auto">
            <Link
              to="/history"
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              History
            </Link>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-left px-2 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
