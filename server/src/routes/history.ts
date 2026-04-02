import { Router, Request, Response } from 'express'
import { Types } from 'mongoose'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { requireAuth } from '../middleware/auth.js'
import { computeHealthScore } from '../services/healthScore.js'

const router = Router()
router.use(requireAuth)

// GET /api/history/stats — must be declared before /:id-style routes
router.get('/stats', async (req: Request, res: Response) => {
  const stats = await computeHealthScore(req.user!._id)
  res.json(stats)
})

// GET /api/history  (optional ?applianceId=)
router.get('/', async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!._id)
  const query: Record<string, unknown> = { userId }
  if (req.query.applianceId) {
    query.applianceId = new Types.ObjectId(req.query.applianceId as string)
  }

  const logs = await MaintenanceLog.find(query)
    .sort({ completedAt: -1 })
    .populate('applianceId', 'name typeId')
    .lean()

  res.json(logs)
})

export default router
