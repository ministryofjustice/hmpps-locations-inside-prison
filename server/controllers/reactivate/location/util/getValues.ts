import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { Location } from '../../../../data/types/locationsApi'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'
import { DecoratedLocationTree, LocationTree } from '../../parent/middleware/populateLocationTree'

export function getValuesForLocation(
  location: Location | DecoratedLocation,
  sessionModel: FormWizard.Request['sessionModel'],
) {
  const { id } = location

  const capacitiesValues: { [field: string]: string } = sessionModel.get('temp-capacitiesValues') || {}
  const errorValues: { [field: string]: string } = sessionModel.get('errorValues') || {}

  let certifiedNormalAccommodation = location.capacity.certifiedNormalAccommodation.toString()
  if (errorValues[`baselineCna-${id}`] !== undefined) {
    certifiedNormalAccommodation = errorValues[`baselineCna-${id}`]
  } else if (capacitiesValues[`baselineCna-${id}`] !== undefined) {
    certifiedNormalAccommodation = capacitiesValues[`baselineCna-${id}`]
  } else if (sessionModel.get<string>(`baselineCna-${id}`) !== undefined) {
    certifiedNormalAccommodation = sessionModel.get<string>(`baselineCna-${id}`)
  }

  let oldWorkingCapacity = location.oldWorkingCapacity.toString()
  if (errorValues[`workingCapacity-${id}`] !== undefined) {
    oldWorkingCapacity = errorValues[`workingCapacity-${id}`]
  } else if (capacitiesValues[`workingCapacity-${id}`] !== undefined) {
    oldWorkingCapacity = capacitiesValues[`workingCapacity-${id}`]
  } else if (sessionModel.get<string>(`workingCapacity-${id}`) !== undefined) {
    oldWorkingCapacity = sessionModel.get<string>(`workingCapacity-${id}`)
  }

  let maxCapacity = location.capacity.maxCapacity.toString()
  if (errorValues[`maximumCapacity-${id}`] !== undefined) {
    maxCapacity = errorValues[`maximumCapacity-${id}`]
  } else if (capacitiesValues[`maximumCapacity-${id}`] !== undefined) {
    maxCapacity = capacitiesValues[`maximumCapacity-${id}`]
  } else if (sessionModel.get<string>(`maximumCapacity-${id}`) !== undefined) {
    maxCapacity = sessionModel.get<string>(`maximumCapacity-${id}`)
  }

  return {
    [`baselineCna-${id}`]: certifiedNormalAccommodation,
    [`workingCapacity-${id}`]: oldWorkingCapacity,
    [`maximumCapacity-${id}`]: maxCapacity,
  }
}

const getValuesForLocationTrees = (
  locationTrees: LocationTree[] | DecoratedLocationTree[],
  sessionModel: FormWizard.Request['sessionModel'],
) => {
  const values = {}

  locationTrees.forEach((locationTree: LocationTree | DecoratedLocationTree) => {
    const location = 'decoratedLocation' in locationTree ? locationTree.decoratedLocation : locationTree.location
    const subLocations =
      'decoratedSubLocations' in locationTree ? locationTree.decoratedSubLocations : locationTree.subLocations

    if (('raw' in location ? location.raw : location).locationType === 'CELL') {
      Object.assign(values, getValuesForLocation(location, sessionModel))
    }
    Object.assign(values, getValuesForLocationTrees(subLocations, sessionModel))
  })

  return values
}

export function getValues(req: FormWizard.Request, res: Response) {
  const locationTrees = res.locals.locationTree || res.locals.decoratedLocationTree

  return getValuesForLocationTrees(locationTrees, req.sessionModel)
}
