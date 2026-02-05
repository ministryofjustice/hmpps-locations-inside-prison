import { Request, Response } from 'express'
import { TypedLocals } from '../../../@types/express'
import addConstantToLocals from '../../../middleware/addConstantToLocals'
import addLocationsToLocationMap from '../../../middleware/addLocationsToLocationMap'
import addUsersToUserMap from '../../../middleware/addUsersToUserMap'

export default async (req: Request, res: Response) => {
  await addConstantToLocals('locationTypes')(req, res, null)
  const locals: TypedLocals = {
    ...res.locals,
    title: 'Cell certificate',
    titleCaption: res.locals.prisonResidentialSummary.prisonSummary.prisonName,
  }

  const success = req.flash('success')
  if (success?.length) {
    locals.banner = {
      success: success[0],
    }
  }

  const { locationsService } = req.services
  const { systemToken } = req.session

  locals.approvalRequests = await locationsService.getCertificateApprovalRequests(systemToken, res.locals.prisonId)

  await addUsersToUserMap(locals.approvalRequests.map(r => r.requestedBy))(req, res, null)
  await addLocationsToLocationMap(
    locals.approvalRequests.filter(r => r.approvalType === 'DEACTIVATION').map(r => r.locationId),
  )(req, res, null)

  return res.render('pages/cellCertificate/changeRequests/index', locals)
}
