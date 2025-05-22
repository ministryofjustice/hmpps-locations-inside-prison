import { type NextFunction, Request, type Response } from 'express'

export default function populatePrisonId() {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.locals.prisonId = req.params.prisonId || res.locals.user.activeCaseload.id

    if (!req.params.prisonId) {
      res.redirect(`${req.originalUrl}/${res.locals.prisonId}`.replace(/\/+/g, '/'))
      return
    }

    next()
  }
}
