/* eslint-disable no-param-reassign */

import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { Location, LocationsApiConstant } from '../../../../data/types/locationsApi'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'
import { DecoratedLocationTree, LocationTree } from '../../parent/middleware/populateLocationTree'
import { getValuesForLocation } from '../util/getValues'

const applyToLocation = (
  location: Location | DecoratedLocation,
  sessionModel: FormWizard.Request['sessionModel'],
  specialistCellTypes: (LocationsApiConstant & {
    additionalInformation?: string
    attributes?: { affectsCapacity: boolean }
  })[],
) => {
  if (('raw' in location ? location.raw : location).locationType !== 'CELL') {
    return
  }

  const { id } = location

  const values = getValuesForLocation(location, sessionModel)
  location.capacity.certifiedNormalAccommodation = Number(values[`baselineCna-${id}`])
  location.oldWorkingCapacity = Number(values[`workingCapacity-${id}`])
  location.capacity.maxCapacity = Number(values[`maximumCapacity-${id}`])

  let cellTypes = location.specialistCellTypes
  if (sessionModel.get<boolean>(`temp-cellTypes${id}-removed`)) {
    cellTypes = []
  } else if (sessionModel.get<string[]>(`temp-cellTypes${id}`)) {
    cellTypes = sessionModel.get<string[]>(`temp-cellTypes${id}`)
  } else if (sessionModel.get<boolean>(`saved-cellTypes${id}-removed`)) {
    cellTypes = []
  } else if (sessionModel.get<string[]>(`saved-cellTypes${id}`)) {
    cellTypes = sessionModel.get<string[]>(`saved-cellTypes${id}`)
  }
  if (!cellTypes) {
    cellTypes = []
  }

  if ('raw' in location) {
    applyToLocation(location.raw, sessionModel, specialistCellTypes)
    location.specialistCellTypes = cellTypes.map(type => specialistCellTypes.find(sct => sct.key === type).description)
  } else {
    location.specialistCellTypes = cellTypes
  }
}

const applyToLocationTrees = (
  locationTrees: LocationTree[] | DecoratedLocationTree[],
  sessionModel: FormWizard.Request['sessionModel'],
  specialistCellTypes: (LocationsApiConstant & {
    additionalInformation?: string
    attributes?: { affectsCapacity: boolean }
  })[],
) => {
  locationTrees.forEach((locationTree: LocationTree | DecoratedLocationTree) => {
    const location = 'decoratedLocation' in locationTree ? locationTree.decoratedLocation : locationTree.location
    const subLocations =
      'decoratedSubLocations' in locationTree ? locationTree.decoratedSubLocations : locationTree.subLocations

    applyToLocation(location, sessionModel, specialistCellTypes)
    applyToLocationTrees(subLocations, sessionModel, specialistCellTypes)
  })
}

export default function applyChangesToLocationTree(req: FormWizard.Request, res: Response, next: NextFunction) {
  const locationTrees = res.locals.locationTree || res.locals.decoratedLocationTree

  applyToLocationTrees(locationTrees, req.sessionModel, res.locals.constants.specialistCellTypes)

  next()
}
