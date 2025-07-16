import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { capitalize } from 'lodash'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../base/formInitialStep'
import { Location } from '../../data/types/locationsApi'
import decorateLocation from '../../decorators/location'

export default class ConfirmCreateLocation extends FormInitialStep {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId, locationId } = res.locals
    const { locationType, structureLevels } = res.locals.values

    // locations API uses singular types; UI needs to display them as plural.
    const singularToPluralMap: Record<string, string> = {
      LANDING: 'Landings',
      CELL: 'Cells',
      SPUR: 'Spurs',
    }

    const pluralize = (level: string) => singularToPluralMap[level] || capitalize(level.toLowerCase())

    const fullStructure = [locationType, ...structureLevels]
    locals.decoratedLocationStructure = fullStructure
      .map((level, i) => (i === 0 ? capitalize(level) : pluralize(level)))
      .join(' → ')

    locals.backLink = backUrl(req, {
      fallbackUrl: `/create-new/${[prisonId, locationId].filter(i => i).join('/')}/structure`,
    })
    locals.cancelLink = `/view-and-update-locations/${[prisonId, locationId].filter(i => i).join('/')}`
    locals.createStructureLink = `/create-new/${[prisonId, locationId].filter(i => i).join('/')}/structure`
    locals.createDetailsLink = `/create-new/${[prisonId, locationId].filter(i => i).join('/')}/details`
    return locals
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { analyticsService, locationsService } = req.services

    try {
      const { sessionModel } = req
      const structureLevels = sessionModel.get<string>('structureLevels')
      const localName = sessionModel.get<string>('localName')
      const locationCode = sessionModel.get<string>('locationCode')
      const locationType = sessionModel.get<string>('locationType')
      const { prisonId } = res.locals

      const fullStructure: string[] = [locationType, ...structureLevels]

      const response = await locationsService.createWing(
        req.session.systemToken,
        prisonId,
        locationCode,
        fullStructure,
        localName,
      )
      req.sessionModel.set('newLocation', response)

      analyticsService.sendEvent(req, `create_${locationType}_location`, {
        prison_id: prisonId,
        code: locationCode,
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
      content: `You have created ${decoratedLocation.locationType.toLowerCase()} ${decoratedLocation.localName || decoratedLocation.code}`,
    })

    res.redirect(`/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`)
  }
}
