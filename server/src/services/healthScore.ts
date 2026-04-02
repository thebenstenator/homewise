import { Types } from 'mongoose'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'

export interface HomeHealthStats {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  overdueCount: number
  dueSoonCount: number
  completedLast30: number
  totalAppliances: number
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export async function computeHealthScore(userId: string): Promise<HomeHealthStats> {
  const now = new Date()
  const in30Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const ago30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const userObjectId = new Types.ObjectId(userId)

  const schedules = await ReminderSchedule.find({ userId: userObjectId, isActive: true }).lean()

  const applianceIds = [...new Set(schedules.map((s) => s.applianceId.toString()))]
  const appliances = await Appliance.find({ _id: { $in: applianceIds } }).lean()
  const typeIds = [...new Set(appliances.map((a) => a.typeId))]
  const types = await ApplianceType.find({ _id: { $in: typeIds } }).lean()

  const applianceMap = Object.fromEntries(appliances.map((a) => [a._id.toString(), a]))
  const typeMap = Object.fromEntries(types.map((t) => [t._id.toString(), t]))

  let score = 100
  let overdueCount = 0
  let dueSoonCount = 0
  let highOverdue = 0
  let medOverdue = 0
  let lowOverdue = 0

  for (const s of schedules) {
    if (s.nextDueAt < now) {
      overdueCount++
      const appliance = applianceMap[s.applianceId.toString()]
      const type = appliance ? typeMap[appliance.typeId] : null
      const task = type?.tasks.find((t) => t.taskId === s.taskId)
      const priority = task?.priority ?? 'medium'
      if (priority === 'high') highOverdue++
      else if (priority === 'medium') medOverdue++
      else lowOverdue++
    } else if (s.nextDueAt <= in30Days) {
      dueSoonCount++
    }
  }

  score -= Math.min(highOverdue * 10, 40)
  score -= Math.min(medOverdue * 5, 20)
  score -= Math.min(lowOverdue * 2, 10)

  const completedLast30 = await MaintenanceLog.countDocuments({
    userId: userObjectId,
    completedAt: { $gte: ago30Days },
  })

  if (completedLast30 > 0) score += 5
  score = Math.max(0, Math.min(100, score))

  const totalAppliances = await Appliance.countDocuments({ userId: userObjectId })

  return {
    score,
    grade: getGrade(score),
    overdueCount,
    dueSoonCount,
    completedLast30,
    totalAppliances,
  }
}
