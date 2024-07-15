import { NextFunction, Request, Response } from 'express'

export default () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Ignore form submissions, or redirects to the current page
    if (req.method !== 'GET' || req.headers.referer?.endsWith(req.originalUrl)) {
      return next()
    }

    req.session.referrerUrl = req.headers.referer

    return next()
  }
}
