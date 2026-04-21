import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import { Location, LocationResidentialSummary } from '../../data/types/locationsApi'
import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'
import { notificationGroups, NotificationType } from '../../services/notificationService'
import config from '../../config'
import { getUserEmails, sendNotification } from '../../utils/notificationHelpers'
import displayName from '../../formatters/displayName'
import capFirst from '../../formatters/capFirst'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'
import addLocationsToLocationMap from '../../middleware/addLocationsToLocationMap'
import LocationsService from '../../services/locationsService'
import { CertificationApprovalRequest } from '../../data/types/locationsApi/certificationApprovalRequest'

function findCells(location: CertificateLocation): CertificateLocation[] {
  if (location.locationType === 'CELL') {
    return [location]
  }

  return location.subLocations.flatMap(findCells)
}

async function locationToCertificationLocation(
  req: FormWizard.Request,
  location: Location,
  modifier?: (originalLocation: Location, certificateLocation: CertificateLocation) => CertificateLocation,
): Promise<CertificateLocation> {
  let certifiedNormalAccommodation = 0
  let workingCapacity = 0
  let maxCapacity = 0
  let cellMark
  let inCellSanitation = false
  let specialistCellTypes: string[] = []
  let subLocations: CertificateLocation[] = []
  if (location.status.includes('DRAFT')) {
    const locationAttributes = getLocationAttributesIncludePending(location)

    certifiedNormalAccommodation = locationAttributes.certifiedNormalAccommodation
    workingCapacity = locationAttributes.workingCapacity
    maxCapacity = locationAttributes.maxCapacity
    cellMark = locationAttributes.cellMark
    inCellSanitation = locationAttributes.inCellSanitation
    specialistCellTypes = location.specialistCellTypes
  }

  let locationWithCertification: Location
  // Reactivate requires the use of getResidentialSummary to populate currentCertificate on the location
  if (!location.leafLevel) {
    const locationSummary = (await req.services.locationsService.getResidentialSummary(
      req.session.systemToken,
      location.prisonId,
      location.id,
    )) as LocationResidentialSummary

    locationWithCertification = locationSummary.parentLocation

    subLocations = await Promise.all(
      locationSummary.subLocations.map((subLocation: Location) =>
        locationToCertificationLocation(req, subLocation, modifier),
      ),
    )
  } else if (['reactivate', 'deactivate'].includes(req.form.options.name)) {
    locationWithCertification = await req.services.locationsService.getLocation(
      req.session.systemToken,
      location.id,
      false,
      true,
    )
  }

  // Populate capacity values and cell types from current certificate
  if (locationWithCertification?.currentCellCertificate) {
    certifiedNormalAccommodation = locationWithCertification.currentCellCertificate.certifiedNormalAccommodation
    workingCapacity = locationWithCertification.currentCellCertificate.workingCapacity
    maxCapacity = locationWithCertification.currentCellCertificate.maxCapacity
    cellMark = locationWithCertification.currentCellCertificate.cellMark
    inCellSanitation = locationWithCertification.currentCellCertificate.inCellSanitation
    specialistCellTypes = locationWithCertification.currentCellCertificate.specialistCellTypes
  }

  let certificationLocation: CertificateLocation = {
    id: location.id,
    locationCode: location.code,
    pathHierarchy: location.pathHierarchy,
    level: location.level,
    certifiedNormalAccommodation,
    workingCapacity,
    maxCapacity,
    currentCertifiedNormalAccommodation: certifiedNormalAccommodation,
    currentWorkingCapacity: workingCapacity,
    currentMaxCapacity: maxCapacity,
    locationType: location.locationType,
    subLocations,
    inCellSanitation,
    cellMark,
    currentCellMark: cellMark,
    currentSpecialistCellTypes: specialistCellTypes,
    specialistCellTypes,
    accommodationTypes: location.accommodationTypes,
    usedFor: location.usedFor,
  }

  if (modifier) {
    certificationLocation = modifier(locationWithCertification || location, certificationLocation)
  }

  return certificationLocation
}

export default class Confirm extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(populateLocation({ includeCurrentCertificate: true }))
    this.use(
      addConstantToLocals([
        'accommodationTypes',
        'deactivatedReasons',
        'locationTypes',
        'specialistCellTypes',
        'usedForTypes',
      ]),
    )
    this.use(this.generateRequests)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { locationsService } = req.services
    const { systemToken } = req.session

    if (location) {
      res.locals.titleCaption = capFirst(await displayName({ location, locationsService, systemToken }))
    }

    await addLocationsToLocationMap([location])(req, res, null)

    return super._locals(req, res, next)
  }

  override locals(_req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(_req, res)

    locals.buttonText = 'Submit for approval'

    return locals
  }

  async generateRequests(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { locals } = res
    const { sessionModel } = req

    const proposedSignedOpCapChange = sessionModel.get<{
      prisonId: string
      signedOperationalCapacity: number
      reasonForChange: string
    }>('proposedSignedOpCapChange')
    const proposedCertificationApprovalRequests: TypedLocals['proposedCertificationApprovalRequests'] = []

    if (req.form.options.name === 'deactivate') {
      const deactivationReason = req.sessionModel.get<string>('deactivationReason')
      const deactivationReasonDescription = req.sessionModel.get<string>(
        `deactivationReason${deactivationReason === 'OTHER' ? 'Other' : 'Description'}`,
      )

      proposedCertificationApprovalRequests.push({
        approvalType: 'DEACTIVATION',
        deactivatedReason: deactivationReason,
        deactivationReasonDescription,
        locationId: locals.location.id,
        locationKey: locals.location.key,
        planetFmReference: req.sessionModel.get<string>('facilitiesManagementReference'),
        prisonId: locals.prisonId,
        proposedReactivationDate: req.sessionModel.get<string>('mandatoryEstimatedReactivationDate'),
        reasonForChange: req.sessionModel.get<string>('workingCapacityExplanation'),
        workingCapacityChange: -locals.location.capacity.workingCapacity,
        locations: [
          await locationToCertificationLocation(req, locals.location, (_, location) => ({
            ...location,
            workingCapacity: 0,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/deactivate/temporary/details/edit`
      locals.changeLinks = {
        deactivatedReason: changeLink,
        proposedReactivationDate: changeLink,
        planetFmReference: changeLink,
        reasonForChange: changeLink,
      }
    } else if (req.form.options.name === 'reactivate') {
      let certifiedNormalAccommodationChange = 0
      let workingCapacityChange = 0
      let maxCapacityChange = 0
      const locations = [
        await locationToCertificationLocation(req, locals.location, (originalLocation, certificateLocation) => {
          if (originalLocation.locationType !== 'CELL') {
            return certificateLocation
          }

          const { id } = originalLocation

          const currentCertifiedNormalAccommodation =
            originalLocation.currentCellCertificate?.certifiedNormalAccommodation ?? 0
          let newCertifiedNormalAccommodation = currentCertifiedNormalAccommodation
          const certifiedNormalAccommodationString = sessionModel.get<string>(`baselineCna-${id}`)

          if (certifiedNormalAccommodationString !== undefined) {
            newCertifiedNormalAccommodation = Number(certifiedNormalAccommodationString)
          }

          certifiedNormalAccommodationChange += newCertifiedNormalAccommodation - currentCertifiedNormalAccommodation

          const currentWorkingCapacity = originalLocation.currentCellCertificate?.workingCapacity ?? 0
          let newWorkingCapacity = originalLocation.oldWorkingCapacity
          const workingCapacityString = sessionModel.get<string>(`workingCapacity-${id}`)

          if (workingCapacityString !== undefined) {
            newWorkingCapacity = Number(workingCapacityString)
          }

          workingCapacityChange += newWorkingCapacity - currentWorkingCapacity

          const currentMaxCapacity = originalLocation.currentCellCertificate?.maxCapacity ?? 0
          let newMaxCapacity = currentMaxCapacity
          const maxCapacityString = sessionModel.get<string>(`maximumCapacity-${id}`)

          if (maxCapacityString !== undefined) {
            newMaxCapacity = Number(maxCapacityString)
          }

          maxCapacityChange += newMaxCapacity - currentMaxCapacity

          const currentSpecialistCellTypes = originalLocation.currentCellCertificate?.specialistCellTypes ?? []
          let newSpecialistCellTypes = currentSpecialistCellTypes
          if (sessionModel.get<boolean>(`saved-cellTypes${id}-removed`)) {
            newSpecialistCellTypes = []
          } else if (sessionModel.get<string[]>(`saved-cellTypes${id}`)) {
            newSpecialistCellTypes = sessionModel.get<string[]>(`saved-cellTypes${id}`)
          }

          return {
            ...certificateLocation,
            currentCertifiedNormalAccommodation,
            certifiedNormalAccommodation: newCertifiedNormalAccommodation,
            currentWorkingCapacity,
            workingCapacity: newWorkingCapacity,
            currentMaxCapacity,
            maxCapacity: newMaxCapacity,
            currentSpecialistCellTypes,
            specialistCellTypes: newSpecialistCellTypes,
          }
        }),
      ]

      locations[0].certifiedNormalAccommodation =
        locations[0].currentCertifiedNormalAccommodation + certifiedNormalAccommodationChange
      locations[0].workingCapacity = locations[0].currentWorkingCapacity + workingCapacityChange
      locations[0].maxCapacity = locations[0].currentMaxCapacity + maxCapacityChange

      proposedCertificationApprovalRequests.push({
        approvalType: 'REACTIVATION',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        prisonId: locals.prisonId,
        certifiedNormalAccommodationChange,
        workingCapacityChange,
        maxCapacityChange,
        locations,
      })
    } else if (req.form.options.name === 'add-to-certificate') {
      proposedCertificationApprovalRequests.push({
        approvalType: 'DRAFT',
        locationId: locals.location.id,
        prisonId: locals.prisonId,
        locations: [await locationToCertificationLocation(req, locals.location)],
      })
    } else if (req.form.options.name === 'change-door-number') {
      const doorNumber = sessionModel.get<string>('doorNumber')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_MARK',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForChange: explanation,
        currentCellMark: locals.location.cellMark,
        cellMark: doorNumber,
      })

      const changeLink = `/location/${locals.location.id}/change-door-number/details/edit`
      locals.changeLinks = {
        reasonForChange: changeLink,
      }
    } else if (req.form.options.name === 'change-sanitation') {
      const inCellSanitation = sessionModel.get<string>('inCellSanitation')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_SANITATION',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForChange: explanation,
        currentInCellSanitation: locals.location.inCellSanitation,
        inCellSanitation: inCellSanitation === 'YES',
      })

      const changeLink = `/location/${locals.location.id}/change-sanitation/details/edit`
      locals.changeLinks = {
        reasonForChange: changeLink,
      }
    } else if (req.form.options.name === 'change-cell-capacity') {
      const newBaselineCna = Number(sessionModel.get<string>('baselineCna'))
      const newWorkingCapacity = Number(sessionModel.get<string>('workingCapacity'))
      const newMaxCapacity = Number(sessionModel.get<string>('maxCapacity'))
      const explanation = sessionModel.get<string>('explanation')
      const { certifiedNormalAccommodation, workingCapacity, maxCapacity } = getLocationAttributesIncludePending(
        locals.location,
      )

      proposedCertificationApprovalRequests.push({
        approvalType: 'CAPACITY',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        prisonId: locals.prisonId,
        reasonForChange: explanation,
        certifiedNormalAccommodationChange: newBaselineCna - certifiedNormalAccommodation,
        workingCapacityChange: newWorkingCapacity - workingCapacity,
        maxCapacityChange: newMaxCapacity - maxCapacity,
        locations: [
          await locationToCertificationLocation(req, locals.location, location => ({
            ...location,
            certifiedNormalAccommodation: newBaselineCna,
            workingCapacity: newWorkingCapacity,
            maxCapacity: newMaxCapacity,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/change-cell-capacity/details/edit`
      locals.changeLinks = {
        reasonForChange: changeLink,
      }
    }

    if (proposedSignedOpCapChange) {
      proposedCertificationApprovalRequests.push({
        approvalType: 'SIGNED_OP_CAP',
        prisonId: proposedSignedOpCapChange.prisonId,
        currentSignedOperationCapacity: locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        signedOperationCapacityChange:
          proposedSignedOpCapChange.signedOperationalCapacity -
          locals.prisonResidentialSummary.prisonSummary.signedOperationalCapacity,
        reasonForChange: proposedSignedOpCapChange.reasonForChange,
      })
    }

    locals.proposedCertificationApprovalRequests = proposedCertificationApprovalRequests
    locals.title = `You are requesting ${proposedCertificationApprovalRequests.length > 1 ? `${proposedCertificationApprovalRequests.length} changes` : 'a change'} to the cell certificate`

    next()
  }

  async submitApprovalRequest(
    locationsService: LocationsService,
    systemToken: string,
    {
      approvalType,
      cellMark,
      currentSignedOperationCapacity,
      deactivatedReason,
      deactivationReasonDescription,
      inCellSanitation,
      locationId,
      locations,
      planetFmReference,
      prisonId,
      proposedReactivationDate,
      reasonForChange,
      signedOperationCapacityChange,
    }: Partial<CertificationApprovalRequest>,
  ) {
    if (approvalType === 'REACTIVATION') {
      return (
        await locationsService.requestReactivation(systemToken, {
          topLevelLocationId: locationId,
          cellReactivationChanges: Object.fromEntries(
            locations
              .flatMap(findCells)
              .map(({ id, certifiedNormalAccommodation, workingCapacity, maxCapacity, specialistCellTypes }) => [
                id,
                {
                  capacity: {
                    certifiedNormalAccommodation,
                    workingCapacity,
                    maxCapacity,
                  },
                  specialistCellTypes,
                },
              ]),
          ),
        })
      ).id
    }

    if (approvalType === 'DEACTIVATION') {
      return (
        await locationsService.deactivateTemporary(
          systemToken,
          locationId,
          deactivatedReason,
          deactivationReasonDescription,
          proposedReactivationDate,
          planetFmReference,
          true,
          reasonForChange,
        )
      ).pendingApprovalRequestId
    }

    if (approvalType === 'CAPACITY_CHANGE') {
      const explanation = reasonForChange
      const capacities = {
        maxCapacity: locations[0].maxCapacity,
        workingCapacity: locations[0].workingCapacity,
        certifiedNormalAccommodation: locations[0].certifiedNormalAccommodation,
      }
      return (
        await locationsService.updateCapacity(systemToken, locationId, {
          ...capacities,
          reasonForChange: explanation,
        })
      ).pendingApprovalRequestId
    }

    if (approvalType === 'DRAFT') {
      return (await locationsService.createCertificationRequestForLocation(systemToken, 'DRAFT', locationId)).id
    }

    if (approvalType === 'CELL_MARK') {
      return (
        await locationsService.updateCellMark(systemToken, locationId, {
          cellMark,
          reasonForChange,
        })
      ).pendingApprovalRequestId
    }

    if (approvalType === 'CELL_SANITATION') {
      return (
        await locationsService.updateCellSanitation(systemToken, locationId, {
          inCellSanitation,
          reasonForChange,
        })
      ).pendingApprovalRequestId
    }

    if (approvalType === 'SIGNED_OP_CAP') {
      return (
        await locationsService.createCertificationRequestForSignedOpCap(
          systemToken,
          prisonId,
          currentSignedOperationCapacity + signedOperationCapacityChange,
          reasonForChange,
        )
      ).id
    }

    throw new Error(`Unsupported approval request type: ${approvalType}`)
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { ingressUrl } = config
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { prisonResidentialSummary, proposedCertificationApprovalRequests, user, location } = res.locals
    const { prisonName } = prisonResidentialSummary.prisonSummary
    const { prisonId } = location
    const submittedBy = user.name

    const approvalRequestIds = await Promise.all(
      proposedCertificationApprovalRequests.map(async r =>
        this.submitApprovalRequest(locationsService, systemToken, r),
      ),
    )

    if (config.production || process.env.NODE_ENV === 'test') {
      await Promise.all(
        approvalRequestIds.map(async approvalRequestId => {
          // Don't send emails in local dev (every deployed env counts as production)
          const url = `${ingressUrl}/${prisonId}/cell-certificate/change-requests/${approvalRequestId}`

          // Send notifications to both sets of relevant cert roles
          const [requestReceivedAddresses, requestSubmittedEmails] = await Promise.all([
            getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestReceivedUsers),
            getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestSubmittedUsers),
          ])

          const notifications = [
            { emailAddresses: requestReceivedAddresses, type: NotificationType.REQUEST_RECEIVED, url: `${url}/review` },
            { emailAddresses: requestSubmittedEmails, type: NotificationType.REQUEST_SUBMITTED, url },
          ]

          await Promise.all(
            notifications.map(({ emailAddresses, type, url: notificationUrl }) =>
              sendNotification(
                notifyService,
                emailAddresses,
                prisonName,
                notificationUrl,
                type,
                undefined,
                undefined,
                undefined,
                submittedBy,
              ),
            ),
          )
        }),
      )
    }

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Change request${approvalRequestIds.length > 1 ? 's' : ''} sent`,
      content: `You have submitted ${approvalRequestIds.length > 1 ? `${approvalRequestIds.length} requests` : 'a request'} to update the cell certificate.`,
    })

    res.redirect(`/${prisonId}/cell-certificate/change-requests`)
  }
}
