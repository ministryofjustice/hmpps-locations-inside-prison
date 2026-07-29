import { type NextFunction, Request, type Response } from 'express'

export default async function redirectToAddPrisonId(req: Request, res: Response, next: NextFunction) {
  if (!req.params.prisonId) {
    const [path, query] = req.originalUrl.split('?')

    let newPath = `${path}/${res.locals.prisonId}`.replace(/\/+/g, '/')
    if (query) {
      newPath += `?${query}`
    }

    res.redirect(newPath)
    return
  }

  next()
}
