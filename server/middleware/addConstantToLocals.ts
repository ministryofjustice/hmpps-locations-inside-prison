import { response, Request, Response, NextFunction } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { LocationsApiConstant } from '../data/types/locationsApi'

async function getConstant(
  req: Request | FormWizard.Request,
  constantName: keyof typeof response.locals.constants,
): Promise<LocationsApiConstant[]> {
  const { locationsService } = req.services
  const { systemToken } = req.session

  switch (constantName) {
    case 'accommodationTypes':
      return locationsService.getAccommodationTypes(systemToken)
    case 'convertedCellTypes':
      return locationsService.getConvertedCellTypes(systemToken)
    case 'deactivatedReasons':
      return locationsService.getDeactivatedReasonsArray(systemToken)
    case 'locationTypes':
      return locationsService.getLocationTypes(systemToken)
    case 'nonResidentialUsageTypes':
      return locationsService.getNonResidentialUsageTypes(systemToken)
    case 'specialistCellTypes':
      return locationsService.getSpecialistCellTypes(systemToken)
    case 'usedForTypes':
      return locationsService.getUsedForTypes(systemToken)
    case 'residentialAttributeTypes':
      return locationsService.getResidentialAttributeTypes(systemToken)
    case 'residentialHousingTypes':
      return locationsService.getResidentialHousingTypes(systemToken)
    default:
      return null
  }
}

export default function addConstantToLocals(
  constantName: keyof typeof response.locals.constants | (keyof typeof response.locals.constants)[],
) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction) => {
    if (!res.locals.constants) {
      res.locals.constants = {}
    }

    if (Array.isArray(constantName)) {
      await Promise.all(
        constantName.map(async name => {
          res.locals.constants[name] = await getConstant(req, name)
        }),
      )
    } else {
      res.locals.constants[constantName] = await getConstant(req, constantName)
    }

    if (next) {
      next()
    }
  }
}
