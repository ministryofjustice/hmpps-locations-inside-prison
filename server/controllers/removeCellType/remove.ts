import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import populateLocation from '../../middleware/populateLocation'

export default class RemoveCellType extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    // decorate the location now that the steps config has been processed
    this.use(populateLocation({ decorate: true }))
  }

  override locals(_req: FormWizard.Request, res: Response) {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId, specialistCellTypes } = decoratedLocation

    const multipleTypes = specialistCellTypes.length > 1

    const pageTitleText = multipleTypes
      ? 'Are you sure you want to remove all of the specific cell types?'
      : 'Are you sure you want to remove the specific cell type?'

    const buttonText = multipleTypes ? 'Remove cell types' : 'Remove cell type'

    const cellTypesLabel = multipleTypes ? 'Cell types:' : 'Cell type:'

    const cellTypesText = specialistCellTypes.join(', ')

    return {
      backLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      buttonText,
      cellTypesLabel,
      cellTypesText,
      pageTitleText,
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
      content: 'You have removed the specific cell type for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
