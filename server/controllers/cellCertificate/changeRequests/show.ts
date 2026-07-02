import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import approvalTypeDescription from '../../../formatters/approvalTypeDescription'
import populateCertificationRequestDetails from '../../../middleware/populateCertificationRequestDetails'

export default async (req: Request, res: Response) => {
  await populateCertificationRequestDetails(req, res)

  const { approvalRequest, constants, prisonId, location } = res.locals
  const locals: TypedLocals = {
    ...res.locals,
    backLink: `/${prisonId}/cell-certificate/${approvalRequest.status === 'APPROVED' ? 'history' : 'change-requests'}`,
    backLinkText: `Back${approvalRequest.status === 'PENDING' ? ' to change requests' : ''}`,
    title: `${approvalTypeDescription(approvalRequest, constants, location)} request details`,
  }

  return res.render('pages/cellCertificate/changeRequests/show', locals)
}
