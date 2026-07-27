import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import { TypedLocals } from '../../@types/express'
import paths from '../../utils/paths'

export default class Details extends FormStep {
  override getInitialValues(_req: FormWizard.Request, res: Response): FormWizard.Values {
    return {
      inCellSanitation: res.locals.decoratedResidentialSummary.location.inCellSanitation ? 'YES' : 'NO',
    }
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)
    const { decoratedResidentialSummary } = res.locals

    return {
      ...locals,
      removeHeadingSpacing: true,
      buttonText: decoratedResidentialSummary.location.status === 'DRAFT' ? 'Save sanitation' : '',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { values } = req.form
      const { location } = res.locals.decoratedResidentialSummary
      const validationErrors: FormWizard.Errors = {}

      if (values.inCellSanitation === (location.inCellSanitation ? 'YES' : 'NO')) {
        return res.redirect(paths.location.view(location))
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
      const inCellSanitation = req.form.values.inCellSanitation as string

      await locationsService.patchLocation(systemToken, locationId, { inCellSanitation: inCellSanitation === 'YES' })

      req.services.analyticsService.sendEvent(req, 'change_sanitation', {
        prison_id: prisonId,
        location_id: locationId,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    if (res.locals.decoratedResidentialSummary.location.status !== 'DRAFT') {
      super.successHandler(req, res, next)
      return
    }

    const { location } = res.locals.decoratedResidentialSummary

    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Sanitation changed',
      content: `You have changed sanitation for ${location.pathHierarchy}.`,
    })
    res.redirect(paths.location.view(location))
  }
}
