import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import addUsersToUserMap from '../../middleware/addUsersToUserMap'

export default async (req: Request, res: Response) => {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { prisonResidentialSummary, prisonId } = res.locals
  const locals: TypedLocals = {
    title: 'Cell certificate',
    titleCaption: prisonResidentialSummary.prisonSummary.prisonName,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  locals.approvalRequests = await locationsService.getCertificateApprovalRequests(systemToken, prisonId)

  try {
    locals.certificate = await locationsService.getCurrentCellCertificate(systemToken, prisonId)

    await addUsersToUserMap([locals.certificate.approvedBy])(req, res, null)
  } catch (e) {
    if (!e.data?.userMessage?.startsWith('Cell certificate not found')) {
      throw e
    }
  }

  return res.render('pages/cellCertificate/current', locals)
}
