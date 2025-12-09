import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import capFirst from '../formatters/capFirst'
import displayName from '../formatters/displayName'

export default async function populateCertificationRequestDetails(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { locationsService, manageUsersService } = req.services
  const { systemToken } = req.session
  const { approvalRequest, user, prisonResidentialSummary, prisonId } = res.locals

  // set title caption
  if (approvalRequest.locationId) {
    const location = await locationsService.getLocation(systemToken, approvalRequest.locationId)
    res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
  } else {
    res.locals.titleCaption = prisonResidentialSummary.prisonSummary.prisonName
  }

  // set userMap with requestedBy details
  if (approvalRequest && user) {
    const requestedByName =
      (await manageUsersService.getUser(user.token, approvalRequest.requestedBy))?.name ?? approvalRequest.requestedBy

    res.locals.userMap = {
      [approvalRequest.requestedBy]: requestedByName,
    }
    res.locals.notificationDetails = {
      requestedBy: requestedByName,
      prisonName: prisonResidentialSummary.prisonSummary.prisonName,
    }
  }

  // set notification details
  res.locals.notificationDetails = {
    ...res.locals.notificationDetails,
    requestedDate: approvalRequest.requestedDate,
    locationKey: approvalRequest.locationKey,
    locationName: approvalRequest.locationKey ? approvalRequest.locationKey.replace(`${prisonId}-`, '') : prisonId,
    changeType:
      approvalRequest.approvalType === 'DRAFT'
        ? 'Add new locations to certificate'
        : 'Change signed operational capacity',
  }

  return next()
}
