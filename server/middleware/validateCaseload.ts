import { type NextFunction, Request, type Response } from 'express'

export default function validateCaseload() {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const { user, prisonId } = res.locals
    if (!user.caseloads.find(caseload => caseload.id === prisonId)) {
      next(new Error('Caseload is not accessible by this user.'))
      return
    }

    next()
  }
}
