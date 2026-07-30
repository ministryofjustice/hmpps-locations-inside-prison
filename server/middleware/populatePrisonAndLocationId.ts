import { type NextFunction, Request, type Response } from 'express'

export default async function populatePrisonAndLocationId(req: Request, res: Response, next: NextFunction) {
  const { locationId, prisonId } = req.params

  res.locals.prisonId = (prisonId as string) || res.locals.user.activeCaseload.id
  res.locals.locationId = locationId as string

  next()
}
