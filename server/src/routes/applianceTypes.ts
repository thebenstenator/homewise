import { Router, Request, Response } from 'express'
import { ApplianceType } from '../models/ApplianceType.js'

const router = Router()

// GET /api/appliance-types
router.get('/', async (_req: Request, res: Response) => {
  const types = await ApplianceType.find().lean()
  res.json(types)
})

// GET /api/appliance-types/:id
router.get('/:id', async (req: Request, res: Response) => {
  const type = await ApplianceType.findById(req.params.id).lean()
  if (!type) {
    res.status(404).json({ error: 'Appliance type not found' })
    return
  }
  res.json(type)
})

export default router
