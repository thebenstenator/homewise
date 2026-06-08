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
  remindersEnabled: boolean
  customNotes?: string
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
    remindersEnabled: { type: Boolean, default: true },
    customNotes: { type: String, trim: true },
  },
  { timestamps: false }
)

ReminderScheduleSchema.index({ userId: 1, isActive: 1, nextDueAt: 1 })

export const ReminderSchedule = model<IReminderSchedule>('ReminderSchedule', ReminderScheduleSchema)
