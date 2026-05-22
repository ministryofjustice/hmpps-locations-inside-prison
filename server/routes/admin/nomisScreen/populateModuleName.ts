import { NextFunction, Request, Response } from 'express'

export const NOMIS_SCREEN_MODULES = ['OIMILOCA', 'OIMULOCA']

// The :moduleName route param is captured by the parent mount. hmpo-form-wizard's
// internal router does not merge it through to the step controllers, so it must be
// read here (in a router with mergeParams) and stashed on res.locals.
export default function populateModuleName(req: Request, res: Response, next: NextFunction) {
  const moduleName = req.params.moduleName as string

  if (!NOMIS_SCREEN_MODULES.includes(moduleName)) {
    const error = new Error(`Unknown NOMIS screen module: ${moduleName}`) as Error & { status?: number }
    error.status = 404
    next(error)
    return
  }

  res.locals.moduleName = moduleName
  next()
}
