import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import displayName from '../../../formatters/displayName'
import capFirst from '../../../formatters/capFirst'
import getPrisonResidentialSummary from '../../../middleware/getPrisonResidentialSummary'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import addUsersToUserMap from '../../../middleware/addUsersToUserMap'
import { Location } from '../../../data/types/locationsApi'
import approvalTypeDescription from '../../../formatters/approvalTypeDescription'

export default async (req: Request, res: Response) => {
  await addConstantToLocals([
    'accommodationTypes',
    'deactivatedReasons',
    'locationTypes',
    'specialistCellTypes',
    'usedForTypes',
  ])(req, res, null)

  const { locationsService } = req.services
  const { systemToken } = req.session
  const { approvalRequest, constants, prisonId } = res.locals
  const locals: TypedLocals = {
    ...res.locals,
    backLink: `/${res.locals.prisonId}/cell-certificate/change-requests`,
    backLinkText: `Back${approvalRequest.status === 'PENDING' ? ' to change requests' : ''}`,
  }

  if (approvalRequest.approvalType === 'SIGNED_OP_CAP' && approvalRequest.status === 'PENDING') {
    await getPrisonResidentialSummary(req, res, null)
  }

  if (approvalRequest.status === 'APPROVED') {
    locals.backLink = `/${prisonId}/cell-certificate/history`
  }

  await addUsersToUserMap([approvalRequest.requestedBy, approvalRequest.approvedOrRejectedBy].filter(u => u))(
    req,
    res,
    null,
  )

  let location: Location
  if (approvalRequest.locationId) {
    location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
    locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
  } else {
    locals.titleCaption = res.locals.prisonResidentialSummary.prisonSummary.prisonName
  }

  locals.title = `${approvalTypeDescription(approvalRequest.approvalType, constants, location)} request details`

  if (location) {
    if (!res.locals.locationMap) {
      res.locals.locationMap = {}
    }

    res.locals.locationMap[location.id] = location
  }

  return res.render('pages/cellCertificate/changeRequests/show', locals)
}
