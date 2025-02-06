import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'

type ErrorPatch = {
  code?: string
  data?: {
    status?: number
    userMessage?: string
    developerMessage?: string
    errorCode?: number
  }
}

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError & ErrorPatch, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    req.services?.analyticsService?.sendEvent(req, 'unhandled_error', {
      prison_id: res.locals?.user?.activeCaseload?.id,
      error_code: error?.data?.errorCode,
    })

    if (!(error as any).isApiError && (error.status === 401 || error.status === 403)) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    if (error.code === 'SESSION_TIMEOUT') {
      return res.redirect(res.locals.baseUrl || '/')
    }

    if (!production) {
      res.locals.message = [error.status, error.message].filter(s => s).join(' - ')
      res.locals.stack = error.stack
    }

    res.status(error.status || 500)

    if (error.status === 404) {
      return res.render('pages/errors/404')
    }

    return res.render('pages/errors/generic')
  }
}
