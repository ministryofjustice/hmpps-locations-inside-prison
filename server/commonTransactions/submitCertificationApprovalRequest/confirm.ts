import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { uniq } from 'lodash'
import FormInitialStep from '../../controllers/base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import { Location, LocationResidentialSummary } from '../../data/types/locationsApi'
import { CertificateLocation } from '../../data/types/locationsApi/certificateLocation'
import { notificationGroups, NotificationType } from '../../services/notificationService'
import config from '../../config'
import { getUserEmails, sendNotification } from '../../utils/notificationHelpers'
import addConstantToLocals from '../../middleware/addConstantToLocals'
import getLocationAttributesIncludePending from '../../utils/getLocationAttributesIncludePending'
import addLocationsToLocationMap from '../../middleware/addLocationsToLocationMap'
import LocationsService from '../../services/locationsService'
import {
  CertificationApprovalRequest,
  CertificationApprovalRequestType,
} from '../../data/types/locationsApi/certificationApprovalRequest'
import populateTitleCaptionFromLocation from '../../middleware/populateTitleCaptionFromLocation'
import logger from '../../../logger'

function findCells(location: CertificateLocation): CertificateLocation[] {
  if (location.locationType === 'CELL') {
    return [location]
  }

  return location.subLocations.flatMap(findCells)
}

function addChangeLinksToLocals(
  locals: TypedLocals,
  requestType: CertificationApprovalRequestType,
  changeLinks: Record<string, string>,
) {
  // eslint-disable-next-line no-param-reassign
  locals.changeLinks = locals.changeLinks || {}

  // eslint-disable-next-line no-param-reassign
  locals.changeLinks[requestType] = changeLinks
}

async function locationToCertificationLocation(
  req: FormWizard.Request,
  location: Location,
  modifier?: (originalLocation: Location, certificateLocation: CertificateLocation) => CertificateLocation,
): Promise<CertificateLocation> {
  let certifiedNormalAccommodation = 0
  let workingCapacity = 0
  let maxCapacity = 0
  let cellMark: string
  let inCellSanitation = false
  let specialistCellTypes: string[] = []
  let convertedCellType: string
  let otherConvertedCellType: string
  let subLocations: CertificateLocation[] = []
  if (location.status.includes('DRAFT')) {
    const locationAttributes = getLocationAttributesIncludePending(location)

    certifiedNormalAccommodation = locationAttributes.certifiedNormalAccommodation
    workingCapacity = locationAttributes.workingCapacity
    maxCapacity = locationAttributes.maxCapacity
    cellMark = locationAttributes.cellMark
    inCellSanitation = locationAttributes.inCellSanitation
    specialistCellTypes = location.specialistCellTypes
    convertedCellType = location.convertedCellType
    otherConvertedCellType = location.otherConvertedCellType
  }
  // TODO: temp, remove this line
  otherConvertedCellType = location.otherConvertedCellType

  let locationWithCertification: Location
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
  } else {
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
    convertedCellType = locationWithCertification.currentCellCertificate.convertedCellType
    otherConvertedCellType = locationWithCertification.currentCellCertificate.otherConvertedCellType
  }

  let certificationLocation: CertificateLocation = {
    id: location.id,
    locationCode: location.code,
    pathHierarchy: location.pathHierarchy,
    level: location.level,
    currentCertifiedNormalAccommodation: certifiedNormalAccommodation,
    certifiedNormalAccommodation,
    currentWorkingCapacity: workingCapacity,
    workingCapacity,
    currentMaxCapacity: maxCapacity,
    maxCapacity,
    locationType: location.locationType,
    subLocations,
    currentInCellSanitation: inCellSanitation,
    inCellSanitation,
    currentCellMark: cellMark,
    cellMark,
    currentSpecialistCellTypes: specialistCellTypes,
    specialistCellTypes,
    currentConvertedCellType: convertedCellType,
    convertedCellType,
    currentOtherConvertedCellType: otherConvertedCellType,
    otherConvertedCellType,
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
    this.use(this.conditionalPopulateLocation)
    this.use(
      addConstantToLocals([
        'accommodationTypes',
        'approvalTypes',
        'convertedCellTypes',
        'deactivatedReasons',
        'locationTypes',
        'specialistCellTypes',
        'usedForTypes',
      ]),
    )
    this.use(this.generateRequests)
    this.use(populateTitleCaptionFromLocation)
  }

  async conditionalPopulateLocation(req: FormWizard.Request, res: Response, next: NextFunction) {
    const locationId = req.params?.locationId || res.locals.locationId
    if (locationId) {
      await populateLocation({ includeCurrentCertificate: true })(req, res)
    }

    if (req.form.options.name === 'cell-conversion') {
      await addLocationsToLocationMap([res.locals.location.topLevelId])(req, res)
    }

    return next()
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals

    if (location) {
      await addLocationsToLocationMap([location])(req, res, null)
    }

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
        planetFmReference: req.sessionModel.get<string>('planetFmReference'),
        prisonId: locals.location.prisonId,
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
      addChangeLinksToLocals(locals, 'DEACTIVATION', {
        deactivatedReason: changeLink,
        proposedReactivationDate: changeLink,
        planetFmReference: changeLink,
        reasonForChange: changeLink,
      })
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
        prisonId: locals.location.prisonId,
        certifiedNormalAccommodationChange,
        workingCapacityChange,
        maxCapacityChange,
        locations,
      })
    } else if (req.form.options.name === 'add-to-certificate') {
      proposedCertificationApprovalRequests.push({
        approvalType: 'DRAFT',
        locationId: locals.location.id,
        prisonId: locals.location.prisonId,
        locations: [await locationToCertificationLocation(req, locals.location)],
      })
    } else if (req.form.options.name === 'change-door-number') {
      const doorNumber = sessionModel.get<string>('doorNumber')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_MARK',
        prisonId: locals.location.prisonId,
        locationId: locals.location.id,
        locationKey: locals.location.key,
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForChange: explanation,
        currentCellMark: locals.location.cellMark,
        cellMark: doorNumber,
      })

      const changeLink = `/location/${locals.location.id}/change-door-number/details/edit`
      addChangeLinksToLocals(locals, 'CELL_MARK', {
        reasonForChange: changeLink,
      })
    } else if (req.form.options.name === 'change-sanitation') {
      const inCellSanitation = sessionModel.get<string>('inCellSanitation')
      const explanation = sessionModel.get<string>('explanation')
      proposedCertificationApprovalRequests.push({
        approvalType: 'CELL_SANITATION',
        prisonId: locals.location.prisonId,
        locationId: locals.location.id,
        locationKey: locals.location.key,
        locations: [await locationToCertificationLocation(req, locals.location)],
        reasonForChange: explanation,
        currentInCellSanitation: locals.location.inCellSanitation,
        inCellSanitation: inCellSanitation === 'YES',
      })

      const changeLink = `/location/${locals.location.id}/change-sanitation/details/edit`
      addChangeLinksToLocals(locals, 'CELL_SANITATION', { reasonForChange: changeLink })
    } else if (req.form.options.name === 'change-cell-capacity') {
      const newBaselineCna = Number(sessionModel.get<string>('baselineCna'))
      const newWorkingCapacity = Number(sessionModel.get<string>('workingCapacity'))
      const newMaxCapacity = Number(sessionModel.get<string>('maxCapacity'))
      const explanation = sessionModel.get<string>('explanation')
      const { certifiedNormalAccommodation, workingCapacity, maxCapacity } = getLocationAttributesIncludePending(
        locals.location,
      )

      proposedCertificationApprovalRequests.push({
        approvalType: 'CAPACITY_CHANGE',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        prisonId: locals.location.prisonId,
        reasonForChange: explanation,
        certifiedNormalAccommodationChange: newBaselineCna - certifiedNormalAccommodation,
        workingCapacityChange: newWorkingCapacity - workingCapacity,
        maxCapacityChange: newMaxCapacity - maxCapacity,
        locations: [
          await locationToCertificationLocation(req, locals.location, (_originalLocation, certificateLocation) => ({
            ...certificateLocation,
            certifiedNormalAccommodation: newBaselineCna,
            workingCapacity: newWorkingCapacity,
            maxCapacity: newMaxCapacity,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/change-cell-capacity/details/edit`
      addChangeLinksToLocals(locals, 'CAPACITY_CHANGE', { reasonForChange: changeLink })
    } else if (req.form.options.name === 'working-capacity-mismatch') {
      const { location } = res.locals
      const certLocation = await locationToCertificationLocation(
        req,
        location,
        (originalLocation, certificateLocation) => ({
          ...certificateLocation,
          workingCapacity: originalLocation.capacity.workingCapacity,
        }),
      )
      const workingCapacityChange = certLocation.workingCapacity - certLocation.currentWorkingCapacity
      proposedCertificationApprovalRequests.push({
        approvalType: 'CAPACITY_CHANGE',
        prisonId: location.prisonId,
        locationId: location.id,
        locationKey: location.key,
        workingCapacityChange,
        locations: [certLocation],
      })
    } else if (req.form.options.name === 'non-residential-conversion') {
      const { location } = res.locals
      const certLocation = await locationToCertificationLocation(req, location)
      proposedCertificationApprovalRequests.push({
        approvalType: 'CONVERT_CELL_TO_ROOM',
        prisonId: location.prisonId,
        locationId: location.id,
        locationKey: location.key,
        locations: [certLocation],
        reasonForChange: req.sessionModel.get<string>('explanation'),
        convertedCellType: req.sessionModel.get<string>('convertedCellType'),
        otherConvertedCellType: req.sessionModel.get<string>('otherConvertedCellType'),
      })
      const changeLink = `/location/${locals.location.id}/non-residential-conversion/details/edit`
      addChangeLinksToLocals(locals, 'CONVERT_CELL_TO_ROOM', {
        nonResidentialRoom: changeLink,
        reasonForChange: changeLink,
      })
      addChangeLinksToLocals(locals, 'SIGNED_OP_CAP', {
        reasonForChange: `/location/${locals.location.id}/non-residential-conversion/update-signed-op-cap/details/edit`,
      })
    } else if (req.form.options.name === 'set-cell-type') {
      const specialistCellTypesValue = sessionModel.get<string | string[]>('set-cell-type_specialistCellTypes')
      const newSpecialistCellTypes = Array.isArray(specialistCellTypesValue)
        ? specialistCellTypesValue
        : [specialistCellTypesValue]
      const newBaselineCna = Number(sessionModel.get<string>('set-cell-type_baselineCna'))
      const newWorkingCapacity = Number(sessionModel.get<string>('set-cell-type_workingCapacity'))
      const newMaxCapacity = Number(sessionModel.get<string>('set-cell-type_maxCapacity'))
      const { certifiedNormalAccommodation, workingCapacity, maxCapacity } = getLocationAttributesIncludePending(
        locals.location,
      )
      const certifiedNormalAccommodationChange = newBaselineCna - certifiedNormalAccommodation
      const workingCapacityChange = newWorkingCapacity - workingCapacity
      const maxCapacityChange = newMaxCapacity - maxCapacity

      proposedCertificationApprovalRequests.push({
        approvalType: 'SPECIALIST_CELL_TYPE',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        prisonId: locals.location.prisonId,
        certifiedNormalAccommodationChange,
        workingCapacityChange,
        maxCapacityChange,
        specialistCellTypes: newSpecialistCellTypes,
        locations: [
          await locationToCertificationLocation(req, locals.location, (_originalLocation, certificateLocation) => ({
            ...certificateLocation,
            certifiedNormalAccommodation: newBaselineCna,
            workingCapacity: newWorkingCapacity,
            maxCapacity: newMaxCapacity,
            specialistCellTypes: newSpecialistCellTypes,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/change-cell-capacity/details/edit`
      addChangeLinksToLocals(locals, 'SPECIALIST_CELL_TYPE', { reasonForChange: changeLink })
    } else if (req.form.options.name === 'cell-conversion') {
      const { location } = res.locals

      const cellMark = req.sessionModel.get<string>('doorNumber')
      const certifiedNormalAccommodation = Number(req.sessionModel.get<string>('CERT_baselineCna'))
      const workingCapacity = Number(req.sessionModel.get<string>('CERT_workingCapacity'))
      const maxCapacity = Number(req.sessionModel.get<string>('CERT_maximumCapacity'))
      const cellTypesRemoved = sessionModel.get<boolean>(`saved-cellTypes-removed`)
      const savedCellTypes = sessionModel.get<string[]>(`saved-cellTypes`)
      const inCellSanitation = sessionModel.get<string>(`inCellSanitation`) === 'YES'
      const accommodationType = sessionModel.get<string>('accommodationType')
      const usedFor = sessionModel.get<string[]>('usedFor') || []
      const specialistCellTypes = cellTypesRemoved ? [] : savedCellTypes || res.locals.location.specialistCellTypes
      const topLevelLocation = res.locals.locationMap[location.topLevelId]
      const topLevelAccommodationTypes = topLevelLocation.accommodationTypes
      const topLevelUsedFor = topLevelLocation.usedFor

      const certLocation = await locationToCertificationLocation(req, location)
      certLocation.accommodationTypes = [accommodationType]
      certLocation.usedFor = usedFor
      const workingCapacityChange = certLocation.workingCapacity - certLocation.currentWorkingCapacity
      const request: (typeof proposedCertificationApprovalRequests)[0] = {
        approvalType: 'CONVERT_ROOM_TO_CELL',
        prisonId: location.prisonId,
        locationId: location.id,
        locationKey: location.key,
        workingCapacityChange,
        currentCellMark: certLocation.currentCellMark,
        cellMark,
        currentInCellSanitation: certLocation.currentInCellSanitation,
        inCellSanitation,
        workingCapacity,
        maxCapacity,
        certifiedNormalAccommodation,
        specialistCellTypes,
        currentConvertedCellType: certLocation.currentConvertedCellType,
        currentOtherConvertedCellType: certLocation.currentOtherConvertedCellType,
        locations: [certLocation],
      }

      if (!topLevelAccommodationTypes.includes(accommodationType)) {
        request.topLevelAccommodationTypes = [...topLevelAccommodationTypes, accommodationType].sort()
        request.topLevelUsedFor = uniq([...topLevelUsedFor, ...usedFor]).sort()
      }

      proposedCertificationApprovalRequests.push(request)
    } else if (req.form.options.name === 'remove-cell-type') {
      const newBaselineCna = Number(sessionModel.get<string>('baselineCna'))
      const newWorkingCapacity = Number(sessionModel.get<string>('workingCapacity'))
      const newMaxCapacity = Number(sessionModel.get<string>('maxCapacity'))
      const { certifiedNormalAccommodation, workingCapacity, maxCapacity } = getLocationAttributesIncludePending(
        locals.location,
      )
      const certifiedNormalAccommodationChange = newBaselineCna ? newBaselineCna - certifiedNormalAccommodation : 0
      const workingCapacityChange = newWorkingCapacity ? newWorkingCapacity - workingCapacity : 0
      const maxCapacityChange = newMaxCapacity ? newMaxCapacity - maxCapacity : 0

      proposedCertificationApprovalRequests.push({
        approvalType: 'SPECIALIST_CELL_TYPE',
        locationId: locals.location.id,
        locationKey: locals.location.key,
        prisonId: locals.prisonId,
        certifiedNormalAccommodationChange,
        workingCapacityChange,
        maxCapacityChange,
        specialistCellTypes: [],
        locations: [
          await locationToCertificationLocation(req, locals.location, (_originalLocation, certificateLocation) => ({
            ...certificateLocation,
            ...(newBaselineCna && { certifiedNormalAccommodation: newBaselineCna }),
            ...(newWorkingCapacity && { workingCapacity: newWorkingCapacity }),
            ...(newMaxCapacity && { maxCapacity: newMaxCapacity }),
            specialistCellTypes: [],
            currentSpecialistCellTypes: locals.location.specialistCellTypes,
          })),
        ],
      })

      const changeLink = `/location/${locals.location.id}/change-cell-capacity/details/edit`
      addChangeLinksToLocals(locals, 'SPECIALIST_CELL_TYPE', { reasonForChange: changeLink })
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
    request: Partial<CertificationApprovalRequest>,
  ) {
    const {
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
    } = request
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
      )[0].pendingApprovalRequestId
    }

    if (approvalType === 'CAPACITY_CHANGE') {
      const { maxCapacity, workingCapacity, certifiedNormalAccommodation } = locations[0]

      return (
        await locationsService.updateCapacity(systemToken, locationId, {
          maxCapacity,
          workingCapacity,
          certifiedNormalAccommodation,
          reasonForChange,
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

    if (approvalType === 'SPECIALIST_CELL_TYPE') {
      const { maxCapacity, workingCapacity, certifiedNormalAccommodation, specialistCellTypes } = locations[0]

      return (
        await locationsService.requestSpecialistCellTypeChange(systemToken, locationId, {
          specialistCellTypes,
          maxCapacity,
          workingCapacity,
          certifiedNormalAccommodation,
        })
      ).id
    }

    if (approvalType === 'CONVERT_ROOM_TO_CELL') {
      const { accommodationTypes, usedFor } = locations[0]
      const { specialistCellTypes, certifiedNormalAccommodation, maxCapacity, workingCapacity } = request

      return (
        await locationsService.convertToCell(systemToken, locationId, {
          accommodationType: accommodationTypes[0],
          specialistCellTypes,
          certifiedNormalAccommodation,
          maxCapacity,
          workingCapacity,
          usedForTypes: usedFor,
          cellMark,
          inCellSanitation,
        })
      ).pendingApprovalRequestId
    }

    if (approvalType === 'CONVERT_CELL_TO_ROOM') {
      const { convertedCellType, otherConvertedCellType } = request

      return (
        await locationsService.convertCellToNonResCell(systemToken, locationId, {
          convertedCellType,
          otherConvertedCellType,
          reasonForChange,
        })
      ).pendingApprovalRequestId
    }

    throw new Error(`Unsupported approval request type: ${approvalType}`)
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { ingressUrl } = config
    const { systemToken } = req.session
    const { locationsService, manageUsersService, notifyService } = req.services
    const { prisonResidentialSummary, proposedCertificationApprovalRequests, user, location } = res.locals
    const { prisonName } = prisonResidentialSummary.prisonSummary
    const prisonId =
      proposedCertificationApprovalRequests[0].prisonId || req.sessionModel.get('prisonId') || location?.prisonId
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
          const [requestReceivedAddresses, requestSubmittedAddresses, requestSubmittedWithActiveCaseloadAddresses] =
            await Promise.all([
              getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestReceivedUsers, false),
              getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.requestSubmittedUsers, false),
              getUserEmails(
                manageUsersService,
                systemToken,
                prisonId,
                notificationGroups.requestSubmittedUsersWithActiveCaseload,
              ),
            ])

          logger.debug(`Found ${requestReceivedAddresses.length} cert reviewer email addresses`)
          logger.debug(`Found ${requestSubmittedAddresses.length} cert viewer email addresses`)
          logger.debug(`Found ${requestSubmittedWithActiveCaseloadAddresses.length} admin email addresses`)

          const notifications = [
            { emailAddresses: requestReceivedAddresses, type: NotificationType.REQUEST_RECEIVED, url: `${url}/review` },
            {
              emailAddresses: [
                ...new Set([...requestSubmittedAddresses, ...requestSubmittedWithActiveCaseloadAddresses]),
              ],
              type: NotificationType.REQUEST_SUBMITTED,
              url,
            },
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
