import 'express'

declare module 'express' {
  interface Request {
    user?: {
      _id: string
      email: string
      name: string
      zipCode: string
    }
  }
}
