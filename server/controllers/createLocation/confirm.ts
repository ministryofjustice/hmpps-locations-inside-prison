import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { capitalize } from 'lodash'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../base/formInitialStep'
import { Location, LocationType } from '../../data/types/locationsApi'
import pluralize from '../../formatters/pluralize'
import decorateLocation from '../../decorators/location'

export default class ConfirmCreateLocation extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId, locationId, values } = res.locals
    const { locationType, structureLevels } = values

    locals.locationType = req.sessionModel.get<LocationType>('locationType')

    locals.createDetailsLink = `/create-new/${locationId || prisonId}/details`

    if (structureLevels?.length) {
      const fullStructure = [locationType, ...structureLevels]
      // locations API uses singular types; UI needs to display them as plural.
      locals.decoratedLocationStructure = fullStructure
        .map((level, i) => (i === 0 ? capitalize(level) : pluralize(level)))
        .join(' → ')
      locals.createStructureLink = `/create-new/${locationId || prisonId}/structure`
    }

    return locals
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { analyticsService, locationsService } = req.services

    try {
      const { sessionModel } = req
      const structureLevels = sessionModel.get<LocationType[]>('structureLevels')
      let localName = sessionModel.get<string>('localName')
      const locationCode = sessionModel.get<string>('locationCode')
      const locationType = sessionModel.get<LocationType>('locationType')
      const { prisonId } = res.locals

      if (localName === '') {
        localName = undefined
      }

      if (structureLevels?.length) {
        const fullStructure: LocationType[] = [locationType, ...structureLevels]

        const response = await locationsService.createWing(
          req.session.systemToken,
          prisonId,
          locationCode,
          fullStructure,
          localName,
        )
        req.sessionModel.set('newLocation', response)
      } else {
        const response = await locationsService.createCells(req.session.systemToken, {
          prisonId,
          parentLocation: sessionModel.get<string>('locationId'),
          newLevelAboveCells: {
            levelCode: locationCode,
            levelLocalName: localName,
            locationType: locationType as 'LANDING' | 'SPUR',
          },
          cellsUsedFor: [],
          accommodationType: 'NORMAL_ACCOMMODATION',
          cells: [],
        })
        req.sessionModel.set('newLocation', response)
      }

      analyticsService.sendEvent(req, `create_${locationType}_location`, {
        prison_id: prisonId,
        code: req.sessionModel.get<Location>('newLocation').pathHierarchy,
        localName,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  async successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { systemToken } = req.session
    const location = req.sessionModel.get<Location>('newLocation')
    const decoratedLocation = await decorateLocation({
      location,
      systemToken,
      userToken: '', // not required when limited: true
      manageUsersService: null, // not required when limited: true
      locationsService: req.services.locationsService,
      limited: true,
    })

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${decoratedLocation.locationType} created`,
      content: `You have created ${decoratedLocation.locationType.toLowerCase()} ${decoratedLocation.localName || decoratedLocation.pathHierarchy}.`,
    })

    res.redirect(`/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`)
  }
}
