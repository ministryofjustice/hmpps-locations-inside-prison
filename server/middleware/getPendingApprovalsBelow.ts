import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function getPendingApprovalsBelow(
  req: FormWizard.Request | Request,
  res: Response,
  next: NextFunction | null,
) {
  if (res.locals.pendingApprovalsBelow) {
    if (next) {
      next()
    }

    return
  }

  res.locals.pendingApprovalsBelow = await req.services.locationsService.getPendingApprovalsBelow(
    req.session.systemToken,
    (res.locals.location || res.locals.decoratedLocation)?.id,
  )

  if (next) {
    next()
  }
}
