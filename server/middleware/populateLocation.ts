import { NextFunction, Request, Response } from 'express'

export default async function populateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { user } = res.locals
  const token = await req.services.authService.getSystemClientToken(user.username)
  res.locals.location = await req.services.locationsService.getLocation(token, req.params.cellId)

  next()
}
