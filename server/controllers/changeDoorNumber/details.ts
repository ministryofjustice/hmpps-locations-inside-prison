import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class Details extends FormStep {
  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    return {
      doorNumber: res.locals.decoratedResidentialSummary.location.cellMark,
    }
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals

    return {
      ...locals,
      removeHeadingSpacing: true,
      buttonText: decoratedResidentialSummary.location.status === 'DRAFT' ? 'Save door number' : '',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { values } = req.form
      const { systemToken } = req.session
      const { decoratedResidentialSummary, prisonId } = res.locals
      const { locationsService } = req.services
      const validationErrors: FormWizard.Errors = {}
      const doorNumber = values.doorNumber as string

      if (doorNumber === decoratedResidentialSummary.location.cellMark) {
        return res.redirect(paths.location.view(decoratedResidentialSummary.location))
      }

      try {
        if (!validationErrors.doorNumber) {
          const duplicateDoorNumberLocations = await locationsService.getLocationByCellMark(
            systemToken,
            prisonId,
            doorNumber,
            decoratedResidentialSummary.location.parentId,
          )

          if (duplicateDoorNumberLocations.length > 0) {
            validationErrors.doorNumber = this.formError('doorNumber', 'taken')
          }
        }
      } catch {
        // handled below
      }
      return callback({ ...errors, ...validationErrors })
    })
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (res.locals.decoratedResidentialSummary.location.status !== 'DRAFT') {
      super.saveValues(req, res, next)
      return
    }
    try {
      const { systemToken } = req.session
      const { locationId, prisonId } = res.locals
      const { locationsService } = req.services
      const cellMark = req.form.values.doorNumber as string

      await locationsService.patchLocation(systemToken, locationId, { cellMark })

      req.services.analyticsService.sendEvent(req, 'change_door_number', {
        prison_id: prisonId,
        location_id: locationId,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedResidentialSummary } = res.locals
    const { location } = decoratedResidentialSummary
    if (location.status !== 'DRAFT') {
      super.successHandler(req, res, next)
      return
    }

    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Cell door number changed',
      content: `You have changed the door number for cell ${location.pathHierarchy}.`,
    })
    res.redirect(paths.location.view(location))
  }
}
