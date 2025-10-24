import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import populateLocation from '../../middleware/populateLocation'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'
import FormInitialStep from '../base/formInitialStep'

export default class ConfirmRemoveCellType extends FormInitialStep {
  override middlewareSetup() {
    this.use(populateLocation({ decorate: true }))
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
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

    return {
      changeSummary,
      title: 'Confirm cell type removal and capacity changes',
      titleCaption: capFirst(decoratedLocation.displayName),
      buttonText: 'Update cell',
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
