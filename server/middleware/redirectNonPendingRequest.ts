import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'

export default async function redirectNonPendingRequest(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { approvalRequestId } = req.params
  const { systemToken } = req.session
  const { locationsService } = req.services

  const certificate = await locationsService.getCertificateApprovalRequest(systemToken, approvalRequestId)

  if (certificate.status !== 'PENDING') {
    return res.redirect(`/${certificate.prisonId}/cell-certificate/change-requests/${approvalRequestId}`)
  }
  return next()
}
