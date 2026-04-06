import cron from 'node-cron'
import { User } from '../models/User.js'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { sendWeeklyDigest, DueTask } from './emailService.js'

export async function runWeeklyDigest(userIdFilter?: string) {
  const query = userIdFilter
    ? { _id: userIdFilter, emailReminders: true }
    : { emailReminders: true }

  const users = await User.find(query).lean()
  const now = new Date()
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  let sent = 0
  let failed = 0

  for (const user of users) {
    try {
      const schedules = await ReminderSchedule.find({
        userId: user._id,
        isActive: true,
        nextDueAt: { $lte: in14Days },
        $or: [{ snoozedUntil: null }, { snoozedUntil: { $lt: now } }],
      }).lean()

      if (schedules.length === 0) continue

      // Enrich with appliance + task info
      const applianceIds = [...new Set(schedules.map((s) => s.applianceId.toString()))]
      const appliances = await Appliance.find({ _id: { $in: applianceIds } }).lean()
      const typeIds = [...new Set(appliances.map((a) => a.typeId))]
      const types = await ApplianceType.find({ _id: { $in: typeIds } }).lean()

      const applianceMap = Object.fromEntries(appliances.map((a) => [a._id.toString(), a]))
      const typeMap = Object.fromEntries(types.map((t) => [t._id.toString(), t]))

      const dueTasks: DueTask[] = schedules.flatMap((s) => {
        const appliance = applianceMap[s.applianceId.toString()]
        const type = appliance ? typeMap[appliance.typeId] : null
        const task = type?.tasks.find((t) => t.taskId === s.taskId)
        if (!appliance || !task) return []

        const daysUntilDue = Math.round(
          (new Date(s.nextDueAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        return [{
          applianceName: appliance.name,
          taskLabel: task.label,
          daysUntilDue,
          diyUrl: task.diyUrl,
          thumbtackCategory: task.thumbtackCategory,
          angiCategory: task.angiCategory,
        }]
      })

      if (dueTasks.length === 0) continue

      await sendWeeklyDigest(
        { email: user.email, name: user.name, zipCode: user.zipCode, unsubscribeToken: user.unsubscribeToken },
        dueTasks
      )
      sent++
    } catch (err) {
      console.error(`Failed to send digest to ${user.email}:`, err)
      failed++
    }
  }

  console.log(`Weekly digest: ${sent} sent, ${failed} failed`)
}

export function startScheduler() {
  // Every Monday at 8:00 AM UTC
  cron.schedule('0 8 * * 1', () => {
    console.log('Running weekly digest...')
    runWeeklyDigest().catch((err) => console.error('Scheduler error:', err))
  }, { timezone: 'UTC' })

  console.log('Scheduler started — weekly digest runs Mondays at 8am UTC')
}
