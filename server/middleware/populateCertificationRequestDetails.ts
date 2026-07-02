import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import capFirst from '../formatters/capFirst'
import displayName from '../formatters/displayName'
import addUsersToUserMap from './addUsersToUserMap'
import addConstantToLocals from './addConstantToLocals'
import addLocationsToLocationMap from './addLocationsToLocationMap'
import { Location } from '../data/types/locationsApi'
import approvalTypeDescription from '../formatters/approvalTypeDescription'

export default async function populateCertificationRequestDetails(
  req: Request | FormWizard.Request,
  res: Response,
  next?: NextFunction,
): Promise<void> {
  const { locationsService } = req.services
  const { systemToken } = req.session
  const { approvalRequest, prisonResidentialSummary, prisonId } = res.locals

  // run promises in parallel to save time
  const promises: Promise<unknown>[] = []

  // set userMap with requestedBy details
  promises.push(
    addUsersToUserMap([approvalRequest.requestedBy, approvalRequest.approvedOrRejectedBy].filter(u => u))(req, res),
  )

  // approval type descriptions are sourced from the backend constants
  promises.push(addConstantToLocals('approvalTypes')(req, res))

  if (['CONVERT_ROOM_TO_CELL', 'CONVERT_CELL_TO_ROOM'].includes(approvalRequest.approvalType)) {
    promises.push(addConstantToLocals('convertedCellTypes')(req, res))
  }

  if (approvalRequest.approvalType === 'DEACTIVATION') {
    promises.push(addConstantToLocals('deactivatedReasons')(req, res))
  }

  if (['DEACTIVATION', 'REACTIVATION'].includes(approvalRequest.approvalType)) {
    promises.push(addConstantToLocals('locationTypes')(req, res))
  }

  let locationPromise: Promise<Location>
  if (approvalRequest.locationId) {
    locationPromise = locationsService.getLocation(systemToken, approvalRequest.locationId)
    promises.push(locationPromise)
  }

  await Promise.all(promises)

  // set title caption
  if (approvalRequest.locationId) {
    res.locals.location = await locationPromise
    await addLocationsToLocationMap([res.locals.location])(req, res)
    res.locals.titleCaption = capFirst(
      await displayName({ location: res.locals.location, locationsService, systemToken }),
    )
  } else {
    res.locals.titleCaption = prisonResidentialSummary.prisonSummary.prisonName
  }

  if (['CONVERT_ROOM_TO_CELL', 'DRAFT'].includes(approvalRequest.approvalType)) {
    await addLocationsToLocationMap([res.locals.location.topLevelId])(req, res)
  }

  // set notification details
  res.locals.notificationDetails = {
    requestedBy: res.locals.userMap[approvalRequest.requestedBy],
    prisonName: prisonResidentialSummary.prisonSummary.prisonName,
    requestedDate: approvalRequest.requestedDate,
    locationKey: approvalRequest.locationKey,
    locationName: approvalRequest.locationKey ? approvalRequest.locationKey.replace(`${prisonId}-`, '') : prisonId,
    changeType: approvalTypeDescription(approvalRequest, res.locals.constants, res.locals.location),
  }

  if (next) {
    next()
  }
}
