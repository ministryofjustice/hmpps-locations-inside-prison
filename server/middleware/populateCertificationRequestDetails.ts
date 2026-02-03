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

  const getChangeType = (approvalType: string): string => {
    switch (approvalType) {
      case 'DRAFT':
        return 'Add new locations to certificate'
      case 'CELL_MARK':
        return 'Cell door number'
      case 'SIGNED_OP_CAP':
        return 'Change signed operational capacity'
      default:
        return approvalType
    }
  }

  // set notification details
  res.locals.notificationDetails = {
    ...res.locals.notificationDetails,
    requestedDate: approvalRequest.requestedDate,
    locationKey: approvalRequest.locationKey,
    locationName: approvalRequest.locationKey ? approvalRequest.locationKey.replace(`${prisonId}-`, '') : prisonId,
    changeType: getChangeType(approvalRequest.approvalType),
  }

  return next()
}
