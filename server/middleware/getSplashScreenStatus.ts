import { type NextFunction, Request, type Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import PrisonService from '../services/prisonService'

export default function getSplashScreenStatus() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { prisonId } = res.locals

    try {
      res.locals.nomisScreenBlocked = await getScreenBlockStatus(req.services.prisonService, systemToken, prisonId)
      next()
    } catch (error) {
      handleScreenStatusError(error, prisonId, next)
    }
  }
}

// In NOMIS the **ALL** condition takes priority over a prison's own condition
async function getScreenBlockStatus(prisonService: PrisonService, token: string, prisonId: string): Promise<boolean> {
  return (
    (await getConditionBlockAccess(prisonService, token, '**ALL**')) ??
    (await getConditionBlockAccess(prisonService, token, prisonId)) ??
    false
  )
}

async function getConditionBlockAccess(
  prisonService: PrisonService,
  token: string,
  conditionValue: string,
): Promise<boolean | undefined> {
  try {
    const condition = await prisonService.getScreenStatus(token, conditionValue)
    return condition.blockAccess
  } catch (error) {
    if (error.responseStatus === 404) {
      return undefined
    }
    throw error
  }
}

function handleScreenStatusError(error: SanitisedError, prisonId: string, next: NextFunction): void {
  if (error.responseStatus !== 404) {
    logger.error(`Failed to check splash screen for prisonId: ${prisonId}`, error)
    next(error)
  } else {
    next()
  }
}
