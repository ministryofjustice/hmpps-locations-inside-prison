import { type NextFunction, Request, type Response } from 'express'
import AuditService, { Page } from '../services/auditService'

export default function logPageView(auditService: AuditService, page: Page) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await auditService.logPageView(page, { who: res.locals.user.username, correlationId: req.id })

    next()
  }
}
