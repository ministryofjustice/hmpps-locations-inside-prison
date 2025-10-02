import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'

export default async (req: Request, res: Response) => {
  const { locationsService, manageUsersService } = req.services
  const { systemToken } = req.session
  const { prisonResidentialSummary, prisonId, user } = res.locals
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

    locals.userMap = {
      [locals.certificate.approvedBy]:
        (await manageUsersService.getUser(user.token, locals.certificate.approvedBy))?.name ||
        locals.certificate.approvedBy,
    }
  } catch (e) {
    if (!e.data?.userMessage?.startsWith('Cell certificate not found')) {
      throw e
    }
  }

  return res.render('pages/cellCertificate/current', locals)
}
