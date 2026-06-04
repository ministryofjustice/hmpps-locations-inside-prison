import { Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import getValues from '../util/getValues'

const getCellForMap = (req: FormWizard.Request, res: Response) => {
  const location = res.locals.decoratedLocation.raw

  const values = getValues(req, res)
  const certifiedNormalAccommodation = Number(values.CERT_baselineCna)
  const workingCapacity = Number(values.CERT_workingCapacity)
  const maxCapacity = Number(values.CERT_maximumCapacity)
  const { sessionModel } = req

  let { specialistCellTypes } = location
  if (sessionModel.get<boolean>(`temp-cellTypes-removed`)) {
    specialistCellTypes = []
  } else if (sessionModel.get<string[]>(`temp-cellTypes`)) {
    specialistCellTypes = sessionModel.get<string[]>(`temp-cellTypes`)
  } else if (sessionModel.get<boolean>(`saved-cellTypes-removed`)) {
    specialistCellTypes = []
  } else if (sessionModel.get<string[]>(`saved-cellTypes`)) {
    specialistCellTypes = sessionModel.get<string[]>(`saved-cellTypes`)
  }
  if (!specialistCellTypes) {
    specialistCellTypes = []
  }

  return {
    ...location,
    capacity: { ...location.capacity, certifiedNormalAccommodation, maxCapacity, workingCapacity },
    specialistCellTypes,
  }
}

export default function populateModifiedLocationMap(req: FormWizard.Request, res: Response, next: NextFunction) {
  const { decoratedLocation } = res.locals
  res.locals.modifiedLocationMap = { [decoratedLocation.id]: getCellForMap(req, res) }

  if (next) {
    next()
  }
}
