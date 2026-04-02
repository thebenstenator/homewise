import { Schema, model } from 'mongoose'

interface IUser {
  email: string
  passwordHash: string
  name: string
  zipCode: string
  emailReminders: boolean
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    emailReminders: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const User = model<IUser>('User', UserSchema)
