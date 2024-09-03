import asyncMiddleware from './asyncMiddleware'

export default function protectRoute(permission: string) {
  return asyncMiddleware((req, res, next) => {
    if (req.canAccess(permission)) {
      return next()
    }

    const error: any = new Error(`Forbidden. Missing permission: '${permission}'`)
    error.status = 403

    return next(error)
  })
}
