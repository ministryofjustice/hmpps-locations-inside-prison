import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { Location } from '../../../../data/types/locationsApi'
import { DecoratedLocation } from '../../../../decorators/decoratedLocation'
import { getValuesForLocation } from '../util/getValues'

const getCellForMap = (location: Location | DecoratedLocation, req: FormWizard.Request) => {
  if ('raw' in location) {
    return getCellForMap(location.raw, req)
  }

  if (location.locationType !== 'CELL') {
    return null
  }

  const { id } = location

  const values = getValuesForLocation(location, req)
  const certifiedNormalAccommodation = Number(values[`baselineCna-${id}`])
  const oldWorkingCapacity = Number(values[`workingCapacity-${id}`])
  const maxCapacity = Number(values[`maximumCapacity-${id}`])
  const { sessionModel } = req

  let { specialistCellTypes } = location
  if (sessionModel.get<boolean>(`temp-cellTypes${id}-removed`)) {
    specialistCellTypes = []
  } else if (sessionModel.get<string[]>(`temp-cellTypes${id}`)) {
    specialistCellTypes = sessionModel.get<string[]>(`temp-cellTypes${id}`)
  } else if (sessionModel.get<boolean>(`saved-cellTypes${id}-removed`)) {
    specialistCellTypes = []
  } else if (sessionModel.get<string[]>(`saved-cellTypes${id}`)) {
    specialistCellTypes = sessionModel.get<string[]>(`saved-cellTypes${id}`)
  }
  if (!specialistCellTypes) {
    specialistCellTypes = []
  }

  return {
    ...location,
    capacity: { ...location.capacity, certifiedNormalAccommodation, maxCapacity },
    oldWorkingCapacity,
    specialistCellTypes,
  }
}

export default function populateModifiedLocationMap(req: FormWizard.Request, res: Response, next: NextFunction) {
  res.locals.modifiedLocationMap = Object.fromEntries(
    (res.locals.decoratedCells || res.locals.cells || [])
      .map(cell => [cell.id, getCellForMap(cell, req)])
      .filter(([, cell]) => cell),
  )

  if (next) {
    next()
  }
}
