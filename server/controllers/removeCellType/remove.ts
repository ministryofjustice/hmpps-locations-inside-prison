import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import populateLocation from '../../middleware/populateLocation'
import capFirst from '../../formatters/capFirst'
import FormInitialStep from '../base/formInitialStep'

export default class RemoveCellType extends FormInitialStep {
  override middlewareSetup() {
    this.use(populateLocation({ decorate: true }))
    super.middlewareSetup()
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { specialistCellTypes } = decoratedLocation

    const multipleTypes = specialistCellTypes.length > 1

    const title = multipleTypes
      ? 'Are you sure you want to remove all of the cell types?'
      : 'Are you sure you want to remove the cell type?'

    const buttonText = multipleTypes ? 'Remove cell types' : 'Remove cell type'

    const cellTypesLabel = multipleTypes ? 'Cell types:' : 'Cell type:'

    const cellTypesText = specialistCellTypes.join(', ')

    return {
      ...super.locals(req, res),
      buttonText,
      cellTypesLabel,
      cellTypesText,
      title,
      titleCaption: capFirst(decoratedLocation.displayName),
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      await locationsService.updateSpecialistCellTypes(req.session.systemToken, decoratedLocation.id, [])

      req.services.analyticsService.sendEvent(req, 'remove_cell_type', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, prisonId } = res.locals.decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Cell type removed',
      content: 'You have removed the cell type for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
