import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }
  res.status(500).json({ error: err.message || 'Internal server error' })
}
