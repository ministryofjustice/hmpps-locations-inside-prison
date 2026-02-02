import { Request, Response } from 'express'
import _ from 'lodash'
import { TypedLocals } from '../../../@types/express'
import displayName from '../../../formatters/displayName'
import capFirst from '../../../formatters/capFirst'
import formatConstants from '../../../formatters/formatConstants'
import getPrisonResidentialSummary from '../../../middleware/getPrisonResidentialSummary'

export default async (req: Request, res: Response) => {
  const { locationsService, manageUsersService } = req.services
  const { systemToken } = req.session
  const { approvalRequest, user, prisonId } = res.locals
  const locals: TypedLocals = {
    backLink: `/${res.locals.prisonId}/cell-certificate/change-requests`,
    backLinkText: `Back${approvalRequest.status === 'PENDING' ? ' to change requests' : ''}`,
  }

  locals.accommodationTypeConstants = await locationsService.getAccommodationTypes(systemToken)
  locals.approvalTypeConstants = await locationsService.getApprovalTypes(systemToken)
  locals.specialistCellTypesObject = await locationsService.getSpecialistCellTypes(systemToken)
  locals.usedForConstants = await locationsService.getUsedForTypes(systemToken)

  if (approvalRequest.approvalType === 'SIGNED_OP_CAP' && approvalRequest.status === 'PENDING') {
    await getPrisonResidentialSummary(req, res, null)
  }

  if (approvalRequest.approvalType === 'CELL_MARK') {
    const location = await locationsService.getLocation(req.session.systemToken, approvalRequest.locationId)
    locals.currentCellMark = location.cellMark
  }

  if (approvalRequest.status === 'APPROVED') {
    locals.backLink = `/${prisonId}/cell-certificate/history`
  }

  locals.userMap = Object.fromEntries(
    await Promise.all(
      _.uniq([approvalRequest.requestedBy, approvalRequest.approvedOrRejectedBy].filter(u => u)).map(async username => [
        username,
        (await manageUsersService.getUser(user.token, username))?.name || username,
      ]),
    ),
  )

  locals.title = `${formatConstants(locals.approvalTypeConstants, approvalRequest.approvalType)} request details`

  if (approvalRequest.locationId) {
    const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
    locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
  } else {
    locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
  }

  return res.render('pages/cellCertificate/changeRequests/show', locals)
}
