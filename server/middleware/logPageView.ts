import { RequestHandler } from 'express'
import AuditService, { Page } from '../services/auditService'

export default function logPageView(auditService: AuditService, page: Page): RequestHandler {
  return async (req, res, next) => {
    await auditService.logPageView(page, { who: res.locals.user.username, correlationId: req.id })

    next()
  }
}
