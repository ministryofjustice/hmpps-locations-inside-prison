import { RequestHandler } from 'express'

export default function validateCaseload(): RequestHandler {
  return async (req, res, next) => {
    const { user, prisonId } = res.locals
    if (!user.caseloads.find(caseload => caseload.id === prisonId)) {
      next(new Error('Caseload is not accessible by this user.'))
      return
    }

    next()
  }
}
