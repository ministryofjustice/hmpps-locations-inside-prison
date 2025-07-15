import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import decorateLocation from '../decorators/location'
import logger from '../../logger'
import { LocationStatus, Location } from '../data/types/locationsApi'

export default async function populateCreateLocation(
  req: Request | FormWizard.Request,
  res: Response,
  next: NextFunction,
) {
  const { locationsService, manageUsersService } = req.services

  let location: Location

  try {
    const { systemToken } = req.session
    location = {
      id: '',
      prisonId: '',
      code: '',
      pathHierarchy: '',
      locationType: (req as FormWizard.Request).sessionModel.get('locationType'),
      residentialHousingType: '',
      localName: '',
      comments: '',
      permanentlyInactive: false,
      permanentlyInactiveReason: '',
      capacity: {
        maxCapacity: 0,
        workingCapacity: 0,
      },
      certification: {
        certified: false,
        capacityOfCertifiedCell: 0,
      },
      attributes: [''],
      usage: [
        {
          usageType: '',
          capacity: 0,
          sequence: 0,
        },
      ],
      accommodationTypes: [''],
      specialistCellTypes: [''],
      usedFor: [''],
      orderWithinParentLocation: 0,
      status: 'INACTIVE' as LocationStatus,
      convertedCellType: '',
      otherConvertedCellType: '',
      active: false,
      deactivatedByParent: false,
      deactivatedDate: '',
      deactivatedReason: '',
      deactivatedBy: '',
      deactivationReasonDescription: '',
      proposedReactivationDate: '',
      topLevelId: '',
      parentId: '',
      parentLocation: '',
      inactiveCells: 0,
      childLocations: [''],
      changeHistory: [
        {
          attribute: '',
          oldValues: [''],
          newValues: [''],
          amendedBy: '',
          amendedDate: '',
        },
      ],
      lastModifiedBy: '',
      lastModifiedDate: '',
      key: '',
      isResidential: false,
      leafLevel: false,
      level: 0,
      sortName: '',
      planetFmReference: '',
      numberOfCellLocations: 0,
      oldWorkingCapacity: 0,
    }

    res.locals.decoratedLocation = await decorateLocation({
      location,
      locationsService,
      manageUsersService,
      systemToken,
      userToken: res.locals.user.token,
      limited: true,
    })
  } catch (error) {
    logger.error(error, `Failed to populate location for: prisonId: ${location?.prisonId}, locationId: ${location?.id}`)
    next(error)
  }

  return next()
}
