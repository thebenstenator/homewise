import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { requireAuth } from '../middleware/auth.js'
import { generateSchedulesForAppliance, deleteSchedulesForAppliance } from '../services/scheduleService.js'

const router = Router()
router.use(requireAuth)

const applianceSchema = z.object({
  typeId: z.string().min(1),
  name: z.string().min(1, 'Name is required').trim(),
  brand: z.string().trim().optional(),
  model: z.string().trim().optional(),
  installYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  notes: z.string().trim().optional(),
})

// GET /api/appliances
router.get('/', async (req: Request, res: Response) => {
  try {
    const appliances = await Appliance.find({ userId: req.user!._id }).lean().sort({ createdAt: -1 })

    const typeIds = [...new Set(appliances.map((a) => a.typeId))]
    const types = await ApplianceType.find({ _id: { $in: typeIds } }).lean()
    const typeMap = Object.fromEntries(types.map((t) => [t._id, t]))

    const result = appliances.map((a) => ({ ...a, applianceType: typeMap[a.typeId] ?? null }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appliances.' })
  }
})

// POST /api/appliances
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = applianceSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    const type = await ApplianceType.findById(parsed.data.typeId).lean()
    if (!type) {
      res.status(400).json({ error: 'Invalid appliance type' })
      return
    }

    const appliance = await Appliance.create({ ...parsed.data, userId: req.user!._id })
    await generateSchedulesForAppliance(appliance._id.toString(), req.user!._id)
    res.status(201).json({ ...appliance.toObject(), applianceType: type })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appliance.' })
  }
})

// PUT /api/appliances/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = applianceSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message })
      return
    }

    const appliance = await Appliance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      parsed.data,
      { new: true }
    ).lean()

    if (!appliance) {
      res.status(404).json({ error: 'Appliance not found' })
      return
    }

    const type = await ApplianceType.findById(appliance.typeId).lean()
    res.json({ ...appliance, applianceType: type ?? null })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appliance.' })
  }
})

// DELETE /api/appliances/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const appliance = await Appliance.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    })

    if (!appliance) {
      res.status(404).json({ error: 'Appliance not found' })
      return
    }

    await deleteSchedulesForAppliance(appliance._id.toString())
    res.json({ message: 'Appliance deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete appliance.' })
  }
})

export default router
