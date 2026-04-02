import { Schema, model, Types } from 'mongoose'

interface IReminderSchedule {
  userId: Types.ObjectId
  applianceId: Types.ObjectId
  taskId: string
  intervalDays: number
  lastCompletedAt: Date | null
  nextDueAt: Date
  snoozedUntil: Date | null
  isActive: boolean
}

const ReminderScheduleSchema = new Schema<IReminderSchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    applianceId: { type: Schema.Types.ObjectId, ref: 'Appliance', required: true },
    taskId: { type: String, required: true },
    intervalDays: { type: Number, required: true },
    lastCompletedAt: { type: Date, default: null },
    nextDueAt: { type: Date, required: true },
    snoozedUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false }
)

export const ReminderSchedule = model<IReminderSchedule>('ReminderSchedule', ReminderScheduleSchema)
