import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  _id: string
  email: string
  name: string
  zipCode: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, zipCode: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ user: User }>('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { user } = await api.post<{ user: User }>('/api/auth/login', { email, password })
    setUser(user)
  }

  async function register(name: string, email: string, password: string, zipCode: string) {
    const { user } = await api.post<{ user: User }>('/api/auth/register', {
      name,
      email,
      password,
      zipCode,
    })
    setUser(user)
  }

  async function logout() {
    await api.post('/api/auth/logout', {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
