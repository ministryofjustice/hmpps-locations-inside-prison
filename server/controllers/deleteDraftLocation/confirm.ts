import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { TypedLocals } from '../../@types/express'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class ConfirmDeleteDraftLocation extends FormStep {
  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals
    const locationType = decoratedResidentialSummary.location.locationType.toLowerCase()
    const isCell = decoratedResidentialSummary.location.locationType === 'Cell'
    const subLocationsClause = isCell ? '' : ' and any locations that are part of it'
    const bodyText = `The ${locationType}${subLocationsClause} will be deleted and cannot be restored.`

    return {
      ...locals,
      locationType,
      bodyText,
      title: `Are you sure you want to delete this ${locationType}?`,
      buttonText: `Delete ${locationType}`,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { locationId, prisonId } = res.locals
      const { locationsService } = req.services

      const token = req.session.systemToken

      await locationsService.deleteDraftLocation(token, locationId)

      req.services.analyticsService.sendEvent(req, 'delete_draft_location', {
        prison_id: prisonId,
        location_id: locationId,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { prisonId, locationType, displayName, parentId } = res.locals.decoratedResidentialSummary.location

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} deleted`,
      content: `You have deleted ${displayName}.`,
    })

    res.redirect(paths.location.view(prisonId, parentId))
  }
}
