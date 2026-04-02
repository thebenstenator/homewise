import { Schema, model } from 'mongoose'

interface IAppliance {
  userId: string
  typeId: string
  name: string
  brand?: string
  model?: string
  installYear?: number
  notes?: string
  createdAt: Date
}

const ApplianceSchema = new Schema<IAppliance>(
  {
    userId: { type: String, required: true, index: true },
    typeId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    installYear: { type: Number, min: 1950, max: new Date().getFullYear() },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const Appliance = model<IAppliance>('Appliance', ApplianceSchema)
