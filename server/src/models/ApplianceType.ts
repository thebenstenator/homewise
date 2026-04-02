import { Schema, model } from 'mongoose'

interface IProduct {
  label: string
  searchUrl: string
}

interface ITask {
  taskId: string
  label: string
  intervalDays: number
  diyUrl: string
  thumbtackCategory: string
  angiCategory: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
  products?: IProduct[]
}

interface IApplianceType {
  _id: string
  label: string
  category: 'hvac' | 'plumbing' | 'electrical' | 'kitchen' | 'exterior' | 'safety'
  iconSlug: string
  tasks: ITask[]
}

const ProductSchema = new Schema<IProduct>(
  {
    label: { type: String, required: true },
    searchUrl: { type: String, required: true },
  },
  { _id: false }
)

const TaskSchema = new Schema<ITask>(
  {
    taskId: { type: String, required: true },
    label: { type: String, required: true },
    intervalDays: { type: Number, required: true },
    diyUrl: { type: String, required: true },
    thumbtackCategory: { type: String, required: true },
    angiCategory: { type: String, required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
    notes: { type: String },
    products: { type: [ProductSchema], default: [] },
  },
  { _id: false }
)

const ApplianceTypeSchema = new Schema<IApplianceType>(
  {
    _id: { type: String },
    label: { type: String, required: true },
    category: {
      type: String,
      enum: ['hvac', 'plumbing', 'electrical', 'kitchen', 'exterior', 'safety'],
      required: true,
    },
    iconSlug: { type: String, required: true },
    tasks: [TaskSchema],
  },
  { _id: false }
)

export const ApplianceType = model<IApplianceType>('ApplianceType', ApplianceTypeSchema)
