import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../base/formInitialStep'

export default class ConfirmDeleteDraftLocation extends FormInitialStep {
  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals
    const { id: locationId, prisonId } = decoratedResidentialSummary.location
    const locationType = decoratedResidentialSummary.location.locationType.toLowerCase()

    const backLink = backUrl(req, {
      fallbackUrl: `/view-and-update-locations/${prisonId}/${locationId}`,
    })

    return {
      ...locals,
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      locationType,
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

    if (!parentId) {
      res.redirect(`/view-and-update-locations/${prisonId}`)
    } else {
      res.redirect(`/view-and-update-locations/${prisonId}/${parentId}`)
    }
  }
}
