import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { recalculateNextDue, enrichSchedules } from '../services/scheduleService.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()
router.use(requireAuth)

// GET /api/schedules — optional ?includeDisabled=true
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeDisabled = req.query.includeDisabled === 'true'
    const query: Record<string, unknown> = { userId: new Types.ObjectId(req.user!._id) }
    if (!includeDisabled) query.isActive = true

    const schedules = await ReminderSchedule.find(query)
      .sort({ nextDueAt: 1 })
      .lean()

    res.json(await enrichSchedules(schedules))
  } catch (err) {
    console.error('Failed to fetch schedules:', err)
    res.status(500).json({ error: 'Failed to fetch schedules.' })
  }
})

// GET /api/schedules/due
router.get('/due', async (req: Request, res: Response) => {
  try {
    const now = new Date()
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const schedules = await ReminderSchedule.find({
      userId: new Types.ObjectId(req.user!._id),
      isActive: true,
      nextDueAt: { $lte: in7Days },
      $or: [{ snoozedUntil: null }, { snoozedUntil: { $lte: now } }],
    })
      .sort({ nextDueAt: 1 })
      .lean()

    res.json(await enrichSchedules(schedules))
  } catch (err) {
    console.error('Failed to fetch due schedules:', err)
    res.status(500).json({ error: 'Failed to fetch due schedules.' })
  }
})

const completeSchema = z.object({
  notes: z.string().max(1000).optional(),
  cost: z.number().min(0).max(1000000).optional(),
  doneBy: z.enum(['self', 'pro']),
  completedAt: z.string().optional().refine((val) => {
    if (!val) return true
    const date = new Date(val)
    if (isNaN(date.getTime())) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date <= tomorrow && date >= new Date('1950-01-01')
  }, 'Completed date must be a valid date'),
})

// POST /api/schedules/:id/complete
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const data = validateBody(completeSchema, req.body, res)
    if (!data) return

    const schedule = await ReminderSchedule.findOne({
      _id: req.params.id,
      userId: new Types.ObjectId(req.user!._id),
    })
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    // Look up task label
    const appliance = await Appliance.findById(schedule.applianceId).lean()
    const type = appliance ? await ApplianceType.findById(appliance.typeId).lean() : null
    const task = type?.tasks.find((t) => t.taskId === schedule.taskId)

    await MaintenanceLog.create({
      userId: schedule.userId,
      applianceId: schedule.applianceId,
      taskId: schedule.taskId,
      taskLabel: task?.label ?? schedule.taskId,
      completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
      notes: data.notes,
      cost: data.cost,
      doneBy: data.doneBy,
    })

    await recalculateNextDue(schedule._id.toString())

    const updated = await ReminderSchedule.findById(schedule._id).lean()
    const [enriched] = await enrichSchedules([updated])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to complete task:', err)
    res.status(500).json({ error: 'Failed to complete task.' })
  }
})

// POST /api/schedules/:id/snooze
router.post('/:id/snooze', async (req: Request, res: Response) => {
  try {
    const parsed = z.object({ days: z.number().int().min(1).max(365) }).safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'days must be a positive integer' })
      return
    }

    const schedule = await ReminderSchedule.findOneAndUpdate(
      { _id: req.params.id, userId: new Types.ObjectId(req.user!._id) },
      { snoozedUntil: new Date(Date.now() + parsed.data.days * 24 * 60 * 60 * 1000) },
      { new: true }
    ).lean()

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    const [enriched] = await enrichSchedules([schedule])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to snooze task:', err)
    res.status(500).json({ error: 'Failed to snooze task.' })
  }
})

// POST /api/schedules/:id/skip — advance nextDueAt by one interval without logging completion
router.post('/:id/skip', async (req: Request, res: Response) => {
  try {
    const schedule = await ReminderSchedule.findOne({
      _id: req.params.id,
      userId: new Types.ObjectId(req.user!._id),
    })
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    const nextDue = new Date(
      Math.max(Date.now(), schedule.nextDueAt.getTime()) +
        schedule.intervalDays * 24 * 60 * 60 * 1000
    )
    schedule.nextDueAt = nextDue
    schedule.snoozedUntil = null
    await schedule.save()

    const [enriched] = await enrichSchedules([schedule.toObject()])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to skip task:', err)
    res.status(500).json({ error: 'Failed to skip task.' })
  }
})

// POST /api/schedules/:id/due-now — move nextDueAt to 2 days from now so task appears in Due Soon
router.post('/:id/due-now', async (req: Request, res: Response) => {
  try {
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const schedule = await ReminderSchedule.findOneAndUpdate(
      { _id: req.params.id, userId: new Types.ObjectId(req.user!._id) },
      { nextDueAt: twoDaysFromNow },
      { new: true }
    ).lean()

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    const [enriched] = await enrichSchedules([schedule])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to reschedule task:', err)
    res.status(500).json({ error: 'Failed to schedule task.' })
  }
})

// PATCH /api/schedules/:id/reminders — toggle email reminders for a single task
router.patch('/:id/reminders', async (req: Request, res: Response) => {
  try {
    const schedule = await ReminderSchedule.findOne({
      _id: req.params.id,
      userId: new Types.ObjectId(req.user!._id),
    })
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }
    schedule.remindersEnabled = !schedule.remindersEnabled
    await schedule.save()
    const [enriched] = await enrichSchedules([schedule.toObject()])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to update reminder setting:', err)
    res.status(500).json({ error: 'Failed to update reminder setting' })
  }
})

const settingsSchema = z.object({
  intervalDays: z.number().int().min(1).optional(),
  customNotes: z.string().max(500).trim().optional().nullable(),
  isActive: z.boolean().optional(),
})

// PUT /api/schedules/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = validateBody(settingsSchema, req.body, res)
    if (!data) return

    const update: Record<string, unknown> = {}
    if (data.intervalDays !== undefined) update.intervalDays = data.intervalDays
    if (data.customNotes !== undefined) update.customNotes = data.customNotes ?? undefined
    if (data.isActive !== undefined) update.isActive = data.isActive

    const schedule = await ReminderSchedule.findOneAndUpdate(
      { _id: req.params.id, userId: new Types.ObjectId(req.user!._id) },
      update,
      { new: true }
    ).lean()

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    const [enriched] = await enrichSchedules([schedule])
    res.json(enriched)
  } catch (err) {
    console.error('Failed to update schedule:', err)
    res.status(500).json({ error: 'Failed to update schedule.' })
  }
})

export default router
