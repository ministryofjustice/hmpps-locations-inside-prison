import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import paths from '../utils/paths'

export default async function redirectNonPendingRequest(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { approvalRequestId } = req.params
  const { systemToken } = req.session
  const { locationsService } = req.services

  const certificate = await locationsService.getCertificateApprovalRequest(systemToken, approvalRequestId as string)

  if (certificate.status !== 'PENDING') {
    return res.redirect(paths.cellCertificate.changeRequest.view(certificate.prisonId, approvalRequestId as string))
  }

  return next()
}
