import { type NextFunction, Request, type Response } from 'express'

export default async function redirectToPrependPrisonId(req: Request, res: Response, next: NextFunction) {
  if (!req.params.prisonId) {
    res.redirect(`/${res.locals.prisonId}/${req.originalUrl}`.replace(/\/+/g, '/'))
    return
  }

  next()
}
