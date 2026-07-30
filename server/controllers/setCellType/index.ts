import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormStep from '../base/formStep'
import paths from '../../utils/paths'

export default class Index extends FormStep {
  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services
      const { values } = req.form

      const types =
        values['set-cell-type_accommodationType'] === 'NORMAL_ACCOMMODATION'
          ? (values['set-cell-type_normalCellTypes'] as string[])
          : [values['set-cell-type_specialistCellTypes'] as string]
      await locationsService.updateSpecialistCellTypes(req.session.systemToken, decoratedLocation.id, types)

      req.services.analyticsService.sendEvent(req, 'set_cell_type', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const {
      decoratedLocation,
      decoratedLocation: { pathHierarchy },
    } = res.locals

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell type set',
      content: `You have set a cell type for ${pathHierarchy}.`,
    })

    res.redirect(paths.location.view(decoratedLocation))
  }
}
