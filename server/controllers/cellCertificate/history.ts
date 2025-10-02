import { Request, Response } from 'express'
import _ from 'lodash'
import { TypedLocals } from '../../@types/express'

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    backLink: `/${res.locals.prisonId}/cell-certificate/current`,
    title: 'History of certificate changes',
    titleCaption: res.locals.prisonResidentialSummary.prisonSummary.prisonName,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  const { manageUsersService, locationsService } = req.services
  const { systemToken } = req.session

  locals.approvalTypeConstants = await locationsService.getApprovalTypes(systemToken)
  locals.certificates = await locationsService.getCellCertificates(systemToken, res.locals.prisonId)

  locals.userMap = Object.fromEntries(
    await Promise.all(
      _.uniq(locals.certificates.map(r => r.approvedRequest.approvedOrRejectedBy)).map(async username => [
        username,
        (await manageUsersService.getUser(res.locals.user.token, username))?.name || username,
      ]),
    ),
  )

  return res.render('pages/cellCertificate/history', locals)
}
