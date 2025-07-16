import { type NextFunction, Request, type Response } from 'express'

export default async function redirectToAddPrisonId(req: Request, res: Response, next: NextFunction) {
  if (!req.params.prisonId) {
    res.redirect(`${req.originalUrl}/${res.locals.prisonId}`.replace(/\/+/g, '/'))
    return
  }

  next()
}
