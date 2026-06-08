import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { MaintenanceLog } from '../models/MaintenanceLog.js'
import { Appliance } from '../models/Appliance.js'
import { ApplianceType } from '../models/ApplianceType.js'
import { requireAuth } from '../middleware/auth.js'
import { computeHealthScore } from '../services/healthScore.js'

const router = Router()
router.use(requireAuth)

// GET /api/history/stats — must be declared before /:id-style routes
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await computeHealthScore(req.user!._id)
    res.json(stats)
  } catch (err) {
    console.error('Failed to fetch stats:', err)
    res.status(500).json({ error: 'Failed to fetch stats.' })
  }
})

// GET /api/history/spending — cost breakdown by appliance and year
router.get('/spending', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!._id)

    const logs = await MaintenanceLog.find({ userId, cost: { $exists: true, $ne: null } })
      .populate('applianceId', 'name typeId')
      .lean()

    const applianceIds = [...new Set(logs.map((l: any) => l.applianceId._id?.toString() ?? l.applianceId.toString()))]
    const appliances = await Appliance.find({ _id: { $in: applianceIds } }).lean()
    const typeIds = [...new Set(appliances.map((a) => a.typeId))]
    const types = await ApplianceType.find({ _id: { $in: typeIds } }).lean()
    const typeMap = Object.fromEntries(types.map((t) => [t._id.toString(), t]))

    let total = 0
    const byAppliance: Record<string, { applianceName: string; category: string; total: number; count: number }> = {}
    const byYear: Record<number, { total: number; count: number }> = {}

    for (const log of logs) {
      const cost = (log as any).cost as number
      const appliance = (log as any).applianceId as { _id: any; name: string; typeId: string }
      const appId = appliance._id?.toString() ?? String(appliance)
      const appName = appliance.name ?? 'Unknown'
      const type = typeMap[appliance.typeId]
      const category = type?.category ?? 'other'
      const year = new Date((log as any).completedAt).getFullYear()

      total += cost
      if (!byAppliance[appId]) byAppliance[appId] = { applianceName: appName, category, total: 0, count: 0 }
      byAppliance[appId].total += cost
      byAppliance[appId].count++
      if (!byYear[year]) byYear[year] = { total: 0, count: 0 }
      byYear[year].total += cost
      byYear[year].count++
    }

    res.json({
      total: Math.round(total * 100) / 100,
      byAppliance: Object.entries(byAppliance)
        .map(([applianceId, v]) => ({ applianceId, ...v, total: Math.round(v.total * 100) / 100 }))
        .sort((a, b) => b.total - a.total),
      byYear: Object.entries(byYear)
        .map(([year, v]) => ({ year: Number(year), ...v, total: Math.round(v.total * 100) / 100 }))
        .sort((a, b) => b.year - a.year),
    })
  } catch (err) {
    console.error('Failed to fetch spending:', err)
    res.status(500).json({ error: 'Failed to fetch spending data.' })
  }
})

// GET /api/history  (optional ?applianceId=)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new Types.ObjectId(req.user!._id)
    const query: Record<string, unknown> = { userId }
    if (req.query.applianceId) {
      const idParsed = z.string().regex(/^[0-9a-f]{24}$/).safeParse(req.query.applianceId)
      if (!idParsed.success) {
        res.status(400).json({ error: 'Invalid appliance ID' })
        return
      }
      query.applianceId = new Types.ObjectId(idParsed.data)
    }

    const logs = await MaintenanceLog.find(query)
      .sort({ completedAt: -1 })
      .populate('applianceId', 'name typeId')
      .lean()

    res.json(logs)
  } catch (err) {
    console.error('Failed to fetch history:', err)
    res.status(500).json({ error: 'Failed to fetch history.' })
  }
})

export default router
