import type { ResponseError } from 'superagent'
import asyncMiddleware from './asyncMiddleware'

export default function protectRoute(permission: string) {
  return asyncMiddleware((req, _res, next) => {
    if (req.canAccess(permission)) {
      return next()
    }

    const error: ResponseError = new Error(`Forbidden. Missing permission: '${permission}'`)
    error.status = 403

    return next(error)
  })
}
