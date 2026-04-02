import { useAuth } from '../context/AuthContext'
import { AppLayout } from '../components/AppLayout'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        Welcome, {user?.name}.
      </h1>
      <p className="text-slate-500">Your appliances will appear here.</p>
    </AppLayout>
  )
}
