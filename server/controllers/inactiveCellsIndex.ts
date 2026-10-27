import { Request, Response } from 'express'
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
    const { inactiveCells, prisonId } = res.locals
    const { locationsService } = req.services
    const { systemToken } = req.session

    // One call for the prison's pending requests. A request approved or withdrawn since the cells were loaded is no
    // longer in it, so look that one up on its own
    const pendingRequestIds = [...new Set(inactiveCells.map(c => c.pendingApprovalRequestId).filter(id => id))]
    const pendingRequests = pendingRequestIds.length
      ? await locationsService.getCertificateApprovalRequests(systemToken, prisonId)
      : []
    const approvalRequests = await Promise.all(
      pendingRequestIds.map(
        id => pendingRequests.find(r => r.id === id) || locationsService.getCertificateApprovalRequest(systemToken, id),
      ),
    )
    res.locals.approvalRequestMap = Object.fromEntries(approvalRequests.map(request => [request.id, request]))

    // Most requests are for one of the cells already listed, so only look up the others
    const requestLocationIds = new Set(approvalRequests.map(r => r.locationId))
    await addLocationsToLocationMap(inactiveCells.map(c => c.raw).filter(l => requestLocationIds.has(l.id)))(req, res)

    await Promise.all([
      addUsersToUserMap(approvalRequests.map(r => r.requestedBy))(req, res, null),
      addLocationsToLocationMap(approvalRequests.map(r => r.locationId))(req, res, null),
      addConstantToLocals(['approvalTypes', 'locationTypes'])(req, res, null),
    ])
  }

  const displayName = res.locals.decoratedResidentialSummary?.location?.displayName
  return res.render('pages/inactiveCells/index', {
    banner,
    title: 'Inactive cells',
    titleCaption: displayName ? capFirst(displayName) : undefined,
  })
}
