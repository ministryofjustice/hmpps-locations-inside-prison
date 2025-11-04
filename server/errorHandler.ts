import type { Request, Response, NextFunction } from 'express'
import { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { ResponseError } from 'superagent'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: SanitisedError | ResponseError, req: Request, res: Response, next: NextFunction): void => {
    const status = 'responseStatus' in error ? error.responseStatus : (error as ResponseError).status
    logger.error(
      `Error (${status}) handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`,
      error,
    )

    req.services?.analyticsService?.sendEvent(req, 'unhandled_error', {
      prison_id: res.locals?.user?.activeCaseload?.id,
      error_code: ((error as SanitisedError).data as { errorCode?: string })?.errorCode,
    })

    if (
      (status === 401 || status === 403) &&
      (error.message.includes('Missing permission') ||
        ('headers' in error &&
          ((error as SanitisedError).headers as { [header: string]: string })['www-authenticate']?.includes(
            'invalid_token',
          )))
    ) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    if ('code' in error && error.code === 'SESSION_TIMEOUT') {
      return res.redirect(res.locals.baseUrl || '/')
    }

    if (!production) {
      res.locals.errorMessage = [status, error.message].filter(s => s).join(' - ')
      res.locals.errorStack = error.stack
    }

    res.status(status || 500)

    if (status === 404) {
      return res.render('pages/errors/404')
    }

    if (res.locals.errorMessage === 'Caseload is not accessible by this user.') {
      return res.render('pages/errors/page')
    }

    if (res.locals.errorMessage === 'Missing prereq for this step') {
      // @ts-expect-error not typing locals for error cases
      res.locals.journeyModel = req.journeyModel
    }

    return res.render('pages/errors/generic')
  }
}
