import { Schema, model, Types } from 'mongoose'

interface IAppliance {
  userId: Types.ObjectId
  typeId: string
  name: string
  brand?: string
  model?: string
  serialNumber?: string
  installYear?: number
  notes?: string
  photoUrl?: string
  createdAt: Date
}

const ApplianceSchema = new Schema<IAppliance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    typeId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    installYear: { type: Number, min: 1950, max: new Date().getFullYear() },
    notes: { type: String, trim: true },
    photoUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Appliance = model<IAppliance>('Appliance', ApplianceSchema)
