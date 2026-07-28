import { type NextFunction, Request, type Response } from 'express'
import { NotFound } from 'http-errors'
import logger from '../../logger'

async function isValidPrisonId(req: Request, prisonId: string) {
  const {
    services: { manageUsersService },
    session: { systemToken },
  } = req

  const caseloads = await manageUsersService.getCaseloads(systemToken)

  return caseloads.some(c => c.id === prisonId)
}

export default async function validateCaseload(req: Request, res: Response, next: NextFunction) {
  const { user, prisonId } = res.locals

  if (!(await isValidPrisonId(req, prisonId))) {
    next(new NotFound())
    return
  }

  if (!user.caseloads.find(caseload => caseload.id === prisonId)) {
    logger.info(`Caseload ${prisonId} is not accessible by this user.`)
    next(new Error('Caseload is not accessible by this user.'))
    return
  }

  next()
}
