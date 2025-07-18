import { type NextFunction, Request, type Response } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import PrisonService from '../services/prisonService'

export default function getServicePrisonsNonHousingDisplay() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { systemToken } = req.session
    const { prisonId } = res.locals

    try {
      await req.services.prisonService.getServiceStatus(systemToken, prisonId, 'DISPLAY_HOUSING_CHECKBOX')
      // set switched off
      res.locals.prisonNonHousingDisabled = true
      next()
    } catch (error) {
      if (error.responseStatus === 404) {
        res.locals.prisonNonHousingDisabled = false
        next()
      } else {
        logger.error(error, `Failed to check prison service non housing display for prisonId: ${prisonId}`)
        next(error)
      }
    }
  }
}

export function getSplashScreenStatus() {
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

async function getScreenBlockStatus(prisonService: PrisonService, token: string, prisonId: string): Promise<boolean> {
  try {
    const condition = await prisonService.getScreenStatus(token, prisonId)
    return condition.blockAccess
  } catch (error) {
    if (error.responseStatus === 404) {
      return getFallbackScreenStatus(prisonService, token)
    }
    throw error
  }
}

async function getFallbackScreenStatus(prisonService: PrisonService, token: string): Promise<boolean> {
  try {
    const condition = await prisonService.getScreenStatus(token, '**ALL**')
    return condition.blockAccess
  } catch (error) {
    if (error.responseStatus === 404) {
      return false
    }
    throw error
  }
}

function handleScreenStatusError(error: SanitisedError, prisonId: string, next: NextFunction): void {
  if (error.responseStatus !== 404) {
    logger.error(error, `Failed to check splash screen for prisonId: ${prisonId}`)
    next(error)
  } else {
    next()
  }
}
