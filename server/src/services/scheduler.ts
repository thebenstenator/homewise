import cron from 'node-cron'
import { User } from '../models/User.js'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { enrichSchedules } from './scheduleService.js'
import { sendWeeklyDigest, sendHealthAlert, DueTask } from './emailService.js'
import { computeHealthScore } from './healthScore.js'

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
        remindersEnabled: { $ne: false },
        nextDueAt: { $lte: in14Days },
        $or: [{ snoozedUntil: null }, { snoozedUntil: { $lt: now } }],
      }).lean()

      if (schedules.length === 0) continue

      const enriched = await enrichSchedules(schedules)
      const dueTasks: DueTask[] = enriched.flatMap((s) => {
        if (!s.appliance || !s.task) return []
        const daysUntilDue = Math.round(
          (new Date(s.nextDueAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        return [{
          applianceId: s.applianceId.toString(),
          applianceName: s.appliance.name,
          taskId: s.taskId,
          taskLabel: s.task.label,
          daysUntilDue,
          thumbtackCategory: s.task.thumbtackCategory,
          angiCategory: s.task.angiCategory,
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

const HEALTH_ALERT_THRESHOLD = 60
const HEALTH_ALERT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function runHealthAlerts(userIdFilter?: string) {
  const query = userIdFilter
    ? { _id: userIdFilter, emailReminders: true }
    : { emailReminders: true }

  const users = await User.find(query).lean()
  const now = new Date()
  let sent = 0
  let failed = 0

  for (const user of users) {
    try {
      const lastSent = user.lastHealthAlertSentAt
      if (lastSent && now.getTime() - lastSent.getTime() < HEALTH_ALERT_COOLDOWN_MS) continue

      const stats = await computeHealthScore(user._id.toString())
      if (stats.score >= HEALTH_ALERT_THRESHOLD || stats.overdueCount === 0) continue

      await sendHealthAlert(
        { email: user.email, name: user.name, zipCode: user.zipCode, unsubscribeToken: user.unsubscribeToken },
        stats.score,
        stats.overdueCount
      )
      await User.findByIdAndUpdate(user._id, { lastHealthAlertSentAt: now })
      sent++
    } catch (err) {
      console.error(`Failed to send health alert to ${user.email}:`, err)
      failed++
    }
  }

  if (sent > 0 || failed > 0) {
    console.log(`Health alerts: ${sent} sent, ${failed} failed`)
  }
}

export function startScheduler() {
  // Every Monday at 8:00 AM UTC — digest + health alerts
  cron.schedule('0 8 * * 1', () => {
    console.log('Running weekly digest...')
    runWeeklyDigest().catch((err) => console.error('Digest scheduler error:', err))
    runHealthAlerts().catch((err) => console.error('Health alert scheduler error:', err))
  }, { timezone: 'UTC' })

  console.log('Scheduler started — weekly digest runs Mondays at 8am UTC')
}
