import { Schema, model, Types } from 'mongoose'

interface IMaintenanceLog {
  userId: Types.ObjectId
  applianceId: Types.ObjectId
  taskId: string
  taskLabel: string
  completedAt: Date
  notes?: string
  cost?: number
  doneBy: 'self' | 'pro'
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applianceId: { type: Schema.Types.ObjectId, ref: 'Appliance', required: true },
    taskId: { type: String, required: true },
    taskLabel: { type: String, required: true },
    completedAt: { type: Date, required: true },
    notes: { type: String },
    cost: { type: Number, min: 0 },
    doneBy: { type: String, enum: ['self', 'pro'], required: true },
  },
  { timestamps: false }
)

export const MaintenanceLog = model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema)
