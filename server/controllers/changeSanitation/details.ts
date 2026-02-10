import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class Details extends FormInitialStep {
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
      titleCaption: `Cell ${capFirst(decoratedResidentialSummary.location.pathHierarchy)}`,
      buttonText: decoratedResidentialSummary.location.status === 'DRAFT' ? 'Save sanitation' : '',
      cancelText: 'Cancel',
    }
  }

  override async validateFields(req: FormWizard.Request, res: Response, callback: (errors: FormWizard.Errors) => void) {
    super.validateFields(req, res, async errors => {
      const { values } = req.form
      const { decoratedResidentialSummary, prisonId, locationId } = res.locals
      const validationErrors: FormWizard.Errors = {}

      if (values.inCellSanitation === (decoratedResidentialSummary.location.inCellSanitation ? 'YES' : 'NO')) {
        return res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
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
    const { id: locationId, prisonId, pathHierarchy } = res.locals.decoratedResidentialSummary.location

    req.journeyModel.reset()
    req.sessionModel.reset()
    req.flash('success', {
      title: 'Sanitation changed',
      content: `You have changed sanitation for ${pathHierarchy}.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
