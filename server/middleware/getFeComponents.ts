import { type NextFunction, Request, type Response } from 'express'
import sanitiseError from '../sanitisedError'

import logger from '../../logger'
import { Services } from '../services'
import config from '../config'

export default function getFrontendComponents({ feComponentsService }: Services) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    if (!config.apis.frontendComponents.enabled) {
      res.locals.feComponents = {}
      return next()
    }

    try {
      const { header, footer, meta } = await feComponentsService.getComponents(
        ['header', 'footer'],
        res.locals.user.token,
      )

      res.locals.feComponents = {
        header: header.html,
        footer: footer.html,
        cssIncludes: [...header.css, ...footer.css],
        jsIncludes: [...header.javascript, ...footer.javascript],
        meta,
      }
      return next()
    } catch (error) {
      const sanitisedError = sanitiseError(error)

      if (sanitisedError.responseStatus === 404) {
        return next()
      }

      logger.error('Failed to retrieve front end components', sanitisedError)
      return next()
    }
  }
}
