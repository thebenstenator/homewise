import { Router, Request, Response } from 'express'
import { User } from '../models/User.js'
import { Appliance } from '../models/Appliance.js'
import { MaintenanceLog } from '../models/MaintenanceLog.js'

const router = Router()

// GET /api/shared/:token — public read-only maintenance history
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ shareToken: req.params.token }).lean()
    if (!user) {
      res.status(404).json({ error: 'Share link not found or has been revoked.' })
      return
    }

    const appliances = await Appliance.find({ userId: user._id }).lean()
    const logs = await MaintenanceLog.find({ userId: user._id })
      .sort({ completedAt: -1 })
      .populate('applianceId', 'name typeId')
      .lean()

    res.json({
      ownerName: user.name,
      appliances: appliances.map((a) => ({
        _id: a._id,
        name: a.name,
        typeId: a.typeId,
        brand: a.brand,
        model: a.model,
        installYear: a.installYear,
      })),
      logs: logs.map((l: any) => ({
        _id: l._id,
        applianceId: l.applianceId,
        taskLabel: l.taskLabel,
        completedAt: l.completedAt,
        doneBy: l.doneBy,
        notes: l.notes,
        // cost intentionally excluded from public view
      })),
    })
  } catch (err) {
    console.error('Failed to fetch shared history:', err)
    res.status(500).json({ error: 'Failed to load shared history.' })
  }
})

export default router
