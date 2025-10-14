import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import formatDate from '../../formatters/formatDate'

export default async (req: Request, res: Response) => {
  const { prisonResidentialSummary, prisonId, user } = res.locals
  const { locationsService, manageUsersService } = req.services
  const { systemToken } = req.session
  const locals: TypedLocals = {
    backLink: `/${prisonId}/cell-certificate/history`,
    titleCaption: prisonResidentialSummary.prisonSummary.prisonName,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  locals.certificate = await locationsService.getCellCertificate(systemToken, req.params.certificateId)

  locals.userMap = {
    [locals.certificate.approvedBy]:
      (await manageUsersService.getUser(user.token, locals.certificate.approvedBy))?.name ||
      locals.certificate.approvedBy,
  }
  locals.title = `Previous cell certificate (${formatDate(locals.certificate.approvedDate)})`

  return res.render('pages/cellCertificate/show', locals)
}
