import { Request, Response } from 'express'
import { TypedLocals } from '../../@types/express'
import addUsersToUserMap from '../../middleware/addUsersToUserMap'
import addLocationsToLocationMap from '../../middleware/addLocationsToLocationMap'
import addConstantToLocals from '../../middleware/addConstantToLocals'

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

  const { locationsService } = req.services
  const { systemToken } = req.session

  locals.certificates = await locationsService.getCellCertificates(systemToken, res.locals.prisonId)

  await addUsersToUserMap(locals.certificates.map(r => r.approvedRequest.approvedOrRejectedBy))(req, res, null)
  await addLocationsToLocationMap(
    locals.certificates
      .filter(r => r.approvedRequest.approvalType === 'DEACTIVATION')
      .map(r => r.approvedRequest.locationId),
  )(req, res, null)
  await addConstantToLocals(['locationTypes'])(req, res, null)

  return res.render('pages/cellCertificate/history', locals)
}
