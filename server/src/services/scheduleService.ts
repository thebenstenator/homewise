import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { MaintenanceLog } from '../models/MaintenanceLog.js'

export async function generateSchedulesForAppliance(applianceId: string, userId: string) {
  const appliance = await Appliance.findById(applianceId).lean()
  if (!appliance) return

  const type = await ApplianceType.findById(appliance.typeId).lean()
  if (!type) return

  const now = new Date()

  for (const task of type.tasks) {
    if (task.isReminder) continue
    const existing = await ReminderSchedule.findOne({ applianceId, taskId: task.taskId })
    if (existing) continue

    // If install year is known, offset nextDueAt based on age
    let nextDueAt: Date
    if (appliance.installYear) {
      const ageMs = now.getTime() - new Date(appliance.installYear, 0, 1).getTime()
      const ageDays = ageMs / (1000 * 60 * 60 * 24)
      const cyclesCompleted = Math.floor(ageDays / task.intervalDays)
      const daysSinceLastCycle = ageDays - cyclesCompleted * task.intervalDays
      const daysUntilNext = task.intervalDays - daysSinceLastCycle
      nextDueAt = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000)
    } else {
      nextDueAt = new Date(now.getTime() + task.intervalDays * 24 * 60 * 60 * 1000)
    }

    await ReminderSchedule.create({
      userId,
      applianceId,
      taskId: task.taskId,
      intervalDays: task.intervalDays,
      lastCompletedAt: null,
      nextDueAt,
      snoozedUntil: null,
      isActive: true,
    })
  }
}

export async function recalculateNextDue(scheduleId: string) {
  const schedule = await ReminderSchedule.findById(scheduleId)
  if (!schedule) return

  const now = new Date()
  schedule.lastCompletedAt = now
  schedule.nextDueAt = new Date(now.getTime() + schedule.intervalDays * 24 * 60 * 60 * 1000)
  schedule.snoozedUntil = null
  await schedule.save()
}

export async function deleteSchedulesForAppliance(applianceId: string) {
  await ReminderSchedule.deleteMany({ applianceId })
  await MaintenanceLog.deleteMany({ applianceId })
}
