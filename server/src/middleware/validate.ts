import { ZodSchema } from 'zod'
import { Response } from 'express'

export function validateBody<T>(schema: ZodSchema<T>, body: unknown, res: Response): T | null {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return null
  }
  return parsed.data
}
