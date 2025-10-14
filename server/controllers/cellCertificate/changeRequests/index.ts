import { Request, Response } from 'express'
import _ from 'lodash'
import { TypedLocals } from '../../../@types/express'

export default async (req: Request, res: Response) => {
  const locals: TypedLocals = {
    title: 'Cell certificate',
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

  locals.approvalRequests = await locationsService.getCertificateApprovalRequests(systemToken, res.locals.prisonId)

  locals.userMap = Object.fromEntries(
    await Promise.all(
      _.uniq(locals.approvalRequests.map(r => r.requestedBy)).map(async username => [
        username,
        (await manageUsersService.getUser(res.locals.user.token, username))?.name || username,
      ]),
    ),
  )

  return res.render('pages/cellCertificate/changeRequests/index', locals)
}
