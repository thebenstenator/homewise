import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { ReminderSchedule } from '../models/ReminderSchedule.js'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { Appliance } from '../models/Appliance.js'
import { recalculateNextDue } from '../services/scheduleService.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Enrich schedules with task details from ApplianceType
async function enrichSchedules(schedules: any[]) {
  const applianceIds = [...new Set(schedules.map((s) => s.applianceId.toString()))]
  const appliances = await Appliance.find({ _id: { $in: applianceIds } }).lean()
  const typeIds = [...new Set(appliances.map((a) => a.typeId))]
  const types = await ApplianceType.find({ _id: { $in: typeIds } }).lean()

  const applianceMap = Object.fromEntries(appliances.map((a) => [a._id.toString(), a]))
  const typeMap = Object.fromEntries(types.map((t) => [t._id.toString(), t]))

  return schedules.map((s) => {
    const appliance = applianceMap[s.applianceId.toString()]
    const type = appliance ? typeMap[appliance.typeId] : null
    const task = type?.tasks.find((t) => t.taskId === s.taskId) ?? null
    return { ...s, appliance: appliance ?? null, task }
  })
}

// GET /api/schedules
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await ReminderSchedule.find({
      userId: new Types.ObjectId(req.user!._id),
      isActive: true,
    })
      .sort({ nextDueAt: 1 })
      .lean()

    res.json(await enrichSchedules(schedules))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedules.' })
  }
})

// GET /api/schedules/due
router.get('/due', async (req: Request, res: Response) => {
  try {
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const schedules = await ReminderSchedule.find({
      userId: new Types.ObjectId(req.user!._id),
      isActive: true,
      nextDueAt: { $lte: in7Days },
    })
      .sort({ nextDueAt: 1 })
      .lean()

    res.json(await enrichSchedules(schedules))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch due schedules.' })
  }
})

// POST /api/schedules/:id/complete
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      notes: z.string().optional(),
      cost: z.number().min(0).optional(),
      doneBy: z.enum(['self', 'pro']),
      completedAt: z.string().optional(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

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
      completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : new Date(),
      notes: parsed.data.notes,
      cost: parsed.data.cost,
      doneBy: parsed.data.doneBy,
    })

    await recalculateNextDue(schedule._id.toString())

    const updated = await ReminderSchedule.findById(schedule._id).lean()
    const [enriched] = await enrichSchedules([updated])
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete task.' })
  }
})

// POST /api/schedules/:id/snooze
router.post('/:id/snooze', async (req: Request, res: Response) => {
  try {
    const parsed = z.object({ days: z.number().int().min(1) }).safeParse(req.body)
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
    res.status(500).json({ error: 'Failed to snooze task.' })
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
    res.status(500).json({ error: 'Failed to schedule task.' })
  }
})

// PUT /api/schedules/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = z.object({ intervalDays: z.number().int().min(1) }).safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'intervalDays must be a positive integer' })
      return
    }

    const schedule = await ReminderSchedule.findOneAndUpdate(
      { _id: req.params.id, userId: new Types.ObjectId(req.user!._id) },
      { intervalDays: parsed.data.intervalDays },
      { new: true }
    ).lean()

    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    res.json(schedule)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule.' })
  }
})

export default router
