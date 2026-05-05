import type { Request, Response, NextFunction } from 'express'

export default function middleware(fn: (req: Request, res: Response, next: NextFunction) => void) {
  return fn
}
