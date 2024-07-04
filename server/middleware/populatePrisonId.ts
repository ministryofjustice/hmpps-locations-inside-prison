import { RequestHandler } from 'express'

export default function populatePrisonId(): RequestHandler {
  return async (req, res, next) => {
    res.locals.prisonId = req.params.prisonId || res.locals.user.activeCaseload.id

    if (!req.params.prisonId) {
      res.redirect(`${req.originalUrl}/${res.locals.prisonId}`.replace(/\/+/g, '/'))
      return
    }

    next()
  }
}
