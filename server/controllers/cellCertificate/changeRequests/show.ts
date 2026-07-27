import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import approvalTypeDescription from '../../../formatters/approvalTypeDescription'
import populateCertificationRequestDetails from '../../../middleware/populateCertificationRequestDetails'
import paths from '../../../utils/paths'

export default async (req: Request, res: Response) => {
  await populateCertificationRequestDetails(req, res)

  const { approvalRequest, constants, prisonId, location } = res.locals
  const locals: TypedLocals = {
    ...res.locals,
    backLink:
      approvalRequest.status === 'APPROVED'
        ? paths.cellCertificate.history(prisonId)
        : paths.cellCertificate.changeRequest.view(prisonId),
    backLinkText: `Back${approvalRequest.status === 'PENDING' ? ' to change requests' : ''}`,
    title: `${approvalTypeDescription(approvalRequest, constants, location)} request details`,
  }

  return res.render('pages/cellCertificate/changeRequests/show', locals)
}
