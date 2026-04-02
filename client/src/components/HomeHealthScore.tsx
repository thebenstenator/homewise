import { useNavigate } from 'react-router-dom'
import type { HomeHealthStats } from '../types/appliance'

interface Props {
  stats: HomeHealthStats | null
  loading: boolean
}

export function HomeHealthScore({ stats, loading }: Props) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 animate-pulse">
        <div className="h-16 bg-slate-100 rounded-lg" />
      </div>
    )
  }

  if (!stats || stats.totalAppliances === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 text-center text-sm text-slate-500">
        Add your appliances to see your home health score.
      </div>
    )
  }

  const { score, grade, overdueCount, dueSoonCount } = stats

  const isGood = grade === 'A' || grade === 'B'
  const isOk = grade === 'C'

  const colorClass = isGood ? 'text-green-600' : isOk ? 'text-amber-500' : 'text-red-500'
  const bgClass = isGood
    ? 'bg-green-50 border-green-200'
    : isOk
    ? 'bg-amber-50 border-amber-200'
    : 'bg-red-50 border-red-200'

  let summary: string
  if (overdueCount === 0 && dueSoonCount === 0) {
    summary = 'Your home is in great shape — nothing needs attention right now.'
  } else if (overdueCount === 0) {
    summary = `Looking good — ${dueSoonCount} task${dueSoonCount !== 1 ? 's' : ''} coming up this week.`
  } else if (overdueCount === 1) {
    summary = 'Your home is doing well — just 1 task needs attention.'
  } else {
    summary = `${overdueCount} tasks are overdue — taking care of them will boost your score.`
  }

  const hasDueSoon = overdueCount > 0 || dueSoonCount > 0

  return (
    <div className={`border rounded-xl p-5 mb-6 flex items-center gap-5 ${bgClass}`}>
      <div className="text-center shrink-0 w-16 flex flex-col items-center gap-1">
        <div className={`text-5xl font-bold leading-none ${colorClass}`}>{score}</div>
        <div className={`text-sm font-semibold ${colorClass}`}>{grade}</div>
      </div>
      <div>
        <p className="font-semibold text-slate-800 mb-1">Home Health Score</p>
        <p className="text-sm text-slate-600">{summary}</p>
        {hasDueSoon && (
          <button
            onClick={() => navigate('/dashboard', { state: { tab: 'due' } })}
            className="text-xs text-slate-500 mt-1 hover:underline cursor-pointer text-left"
          >
            {overdueCount > 0 && `${overdueCount} overdue`}
            {overdueCount > 0 && dueSoonCount > 0 && ' · '}
            {dueSoonCount > 0 && `${dueSoonCount} due this week`}
          </button>
        )}
      </div>
    </div>
  )
}
