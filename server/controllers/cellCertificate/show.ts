import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import formatDate from '../../formatters/formatDate'
import addUsersToUserMap from '../../middleware/addUsersToUserMap'

export default async (req: Request, res: Response) => {
  const { prisonResidentialSummary, prisonId } = res.locals
  const { locationsService } = req.services
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

  await addUsersToUserMap([locals.certificate.approvedBy])(req, res, null)
  locals.title = `Previous cell certificate (${formatDate(locals.certificate.approvedDate)})`

  return res.render('pages/cellCertificate/show', locals)
}
