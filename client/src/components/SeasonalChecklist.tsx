import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sun, Leaf, Snowflake, Sprout, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import type { Appliance } from '../types/appliance'
import {
  getCurrentSeason,
  getSeasonalTasksForUser,
  type Season,
} from '../lib/seasonalTasks'

const seasonConfig: Record<Season, {
  label: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  iconClass: string
  borderClass: string
  bgClass: string
  headingClass: string
}> = {
  spring: {
    label: 'Spring',
    Icon: Sprout,
    iconClass: 'text-green-600',
    borderClass: 'border-green-200',
    bgClass: 'bg-green-50',
    headingClass: 'text-green-800',
  },
  summer: {
    label: 'Summer',
    Icon: Sun,
    iconClass: 'text-yellow-500',
    borderClass: 'border-yellow-200',
    bgClass: 'bg-yellow-50',
    headingClass: 'text-yellow-800',
  },
  fall: {
    label: 'Fall',
    Icon: Leaf,
    iconClass: 'text-orange-500',
    borderClass: 'border-orange-200',
    bgClass: 'bg-orange-50',
    headingClass: 'text-orange-800',
  },
  winter: {
    label: 'Winter',
    Icon: Snowflake,
    iconClass: 'text-blue-500',
    borderClass: 'border-blue-200',
    bgClass: 'bg-blue-50',
    headingClass: 'text-blue-800',
  },
}

interface Props {
  appliances: Appliance[]
}

export function SeasonalChecklist({ appliances }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const season = getCurrentSeason()
  const tasks = getSeasonalTasksForUser(season, appliances)

  if (tasks.length === 0) return null

  const { label, Icon, iconClass, borderClass, bgClass, headingClass } = seasonConfig[season]

  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} mb-6`}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconClass} />
          <span className={`text-sm font-semibold ${headingClass}`}>
            {label} Tasks
          </span>
          <span className="text-xs text-slate-500 font-normal">
            {tasks.length} for your appliances
          </span>
        </div>
        {collapsed
          ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
          : <ChevronUp size={16} className="text-slate-400 shrink-0" />
        }
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {tasks.map((task) => (
            <Link
              key={`${task.applianceId}-${task.taskId}`}
              to={`/appliances/${task.applianceId}?diy=${task.taskId}`}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-white hover:border-slate-200 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{task.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{task.applianceName}</p>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
