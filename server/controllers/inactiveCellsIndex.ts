import { Request, Response } from 'express'
import _ from 'lodash'
import capFirst from '../formatters/capFirst'
import addUsersToUserMap from '../middleware/addUsersToUserMap'
import addConstantToLocals from '../middleware/addConstantToLocals'
import addLocationsToLocationMap from '../middleware/addLocationsToLocationMap'

export default async (req: Request, res: Response) => {
  const banner: {
    success?: {
      title: string
      content: string
    }
  } = {}

  const success = req.flash('success')
  if (success?.length) {
    ;[banner.success] = success
  }

  const isCertificationActive = res.locals.prisonConfiguration.certificationApprovalRequired === 'ACTIVE'
  if (isCertificationActive) {
    const { inactiveCells } = res.locals
    const { locationsService } = req.services
    const { systemToken } = req.session

    const approvalRequests = await Promise.all(
      _.uniq(inactiveCells.map(c => c.pendingApprovalRequestId).filter(id => id)).map(id =>
        locationsService.getCertificateApprovalRequest(systemToken, id),
      ),
    )
    res.locals.approvalRequestMap = Object.fromEntries(approvalRequests.map(request => [request.id, request]))

    await Promise.all([
      addUsersToUserMap(approvalRequests.map(r => r.requestedBy))(req, res, null),
      addLocationsToLocationMap(approvalRequests.map(r => r.locationId))(req, res, null),
      addConstantToLocals('locationTypes')(req, res, null),
    ])
  }

  const displayName = res.locals.decoratedResidentialSummary?.location?.displayName
  return res.render('pages/inactiveCells/index', {
    banner,
    title: 'Inactive cells',
    titleCaption: displayName ? capFirst(displayName) : undefined,
  })
}
