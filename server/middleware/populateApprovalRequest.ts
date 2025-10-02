import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function populateApprovalRequest(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { locationsService } = req.services
  const { systemToken } = req.session
  res.locals.approvalRequest = await locationsService.getCertificateApprovalRequest(
    systemToken,
    req.params.approvalRequestId,
  )

  return next()
}
