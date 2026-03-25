import { NextFunction, Request, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import _ from 'lodash'
import { Location } from '../data/types/locationsApi'

export default function addLocationsToLocationMap(locationsOrIds: string[] | Location[]) {
  return async (req: Request | FormWizard.Request, res: Response, next: NextFunction) => {
    const { locals } = res
    const { session, services } = req
    const { systemToken } = session
    const { locationsService } = services
    if (!locals.locationMap) {
      locals.locationMap = {}
    }

    if (typeof locationsOrIds[0] !== 'string') {
      // It's an array of Location objects, so add them directly to the map
      ;(locationsOrIds as Location[]).forEach(location => {
        locals.locationMap[location.id] = location
      })
    } else {
      // It's an array of location IDs, so fetch any that aren't already in the map
      await Promise.all(
        _.uniq(locationsOrIds as string[])
          .filter(id => !locals.locationMap[id])
          .map(async id => {
            locals.locationMap[id] = await locationsService.getLocation(systemToken, id)
          }),
      )
    }

    if (next) {
      next()
    }
  }
}
