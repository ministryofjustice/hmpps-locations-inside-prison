import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../utils/backUrl'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'

export default class ConfirmRemoveCellType extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(populateLocation({ decorate: true }))
  }

  override locals(req: FormWizard.Request, res: Response): object {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity

    const newWorkingCap = Number(req.sessionModel.get('workingCapacity'))
    const newMaxCap = Number(req.sessionModel.get('maxCapacity'))
    const { prisonResidentialSummary } = res.locals

    const changeSummaries = compact([
      generateChangeSummary(
        'working capacity',
        workingCapacity,
        newWorkingCap,
        prisonResidentialSummary.prisonSummary.workingCapacity,
      ),
      generateChangeSummary(
        'maximum capacity',
        maxCapacity,
        newMaxCap,
        prisonResidentialSummary.prisonSummary.maxCapacity,
      ),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    const backLink = backUrl(req, { fallbackUrl: `/location/${decoratedLocation.id}/remove-cell-type/review` })

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      const token = req.session.systemToken
      await locationsService.updateCapacity(
        token,
        decoratedLocation.id,
        Number(req.sessionModel.get('maxCapacity')),
        Number(req.sessionModel.get('workingCapacity')),
      )

      await locationsService.updateSpecialistCellTypes(token, decoratedLocation.id, [])

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
      title: 'Cell updated',
      content: 'You have removed the cell type and updated the capacity for this location.',
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
