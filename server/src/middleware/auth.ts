import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],
    }) as {
      _id: string
      email: string
      name: string
      zipCode: string
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
}
