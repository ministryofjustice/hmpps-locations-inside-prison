import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { capitalize } from 'lodash'
import backUrl from '../../utils/backUrl'

export default class ConfirmCreateLocation extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
  }

  locals(req: FormWizard.Request, res: Response): object {
    const { values, prisonId } = res.locals
    const { locationType } = res.locals.decoratedLocation
    const displayLocalName =
      typeof values.localName === 'string' && values.localName.trim() !== '' ? values.localName.trim() : 'Not set'

    // locations API uses singular types; UI needs to display them as plural.
    const singularToPluralMap: Record<string, string> = {
      LANDING: 'Landings',
      CELL: 'Cells',
      SPUR: 'Spurs',
    }

    const pluralize = (level: string) => singularToPluralMap[level] || capitalize(level.toLowerCase())

    const fullStructure = [locationType.toUpperCase(), ...values.structureLevels]
    const decoratedFullStructure = fullStructure
      .map((level, i) => (i === 0 ? capitalize(level) : pluralize(level)))
      .join(' → ')

    const backLink = backUrl(req, {
      fallbackUrl: `/manage-locations/${prisonId}/create-new-${locationType.toLowerCase()}/structure`,
    })
    const detailsLink = backUrl(req, {
      fallbackUrl: `/manage-locations/${prisonId}/create-new-${locationType.toLowerCase()}/details`,
    })

    return {
      decoratedFullStructure,
      displayLocalName,
      backLink,
      detailsLink,
      cancelLink: `/manage-locations/${prisonId}`,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const { sessionModel } = req
      const structureLevels = sessionModel.get<string>('structureLevels')
      const localName = sessionModel.get<string>('localName')
      const locationCode = sessionModel.get<string>('locationCode')
      const { locationType } = res.locals.decoratedLocation
      const { prisonId } = res.locals

      const fullStructure: string[] = [locationType.toUpperCase(), ...structureLevels]

      const response = await locationsService.createWing(
        req.session.systemToken,
        prisonId,
        locationCode,
        fullStructure,
        localName,
      )
      Object.assign(res.locals.decoratedLocation, {
        id: response.id,
        prisonId: response.prisonId,
        code: response.code,
        localName: response.localName,
      })

      analyticsService.sendEvent(req, `create_${locationType}_location`, {
        prison_id: decoratedLocation.prisonId,
        code: decoratedLocation.code,
        localName: decoratedLocation.localName,
      })
      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, code: locationCode, localName, prisonId } = res.locals.decoratedLocation
    const { locationType } = res.locals.decoratedLocation
    const displayName: string = localName || locationCode

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} created`,
      content: `You have created ${locationType.toLowerCase()} ${displayName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
