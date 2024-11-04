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

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    if (error.code === 'SESSION_TIMEOUT') {
      return res.redirect(res.locals.baseUrl || '/')
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
