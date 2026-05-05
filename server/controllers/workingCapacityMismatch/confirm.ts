import FormWizard from 'hmpo-form-wizard'
import { NextFunction, Response } from 'express'
import FormInitialStep from '../base/formInitialStep'
import { TypedLocals } from '../../@types/express'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import generateChangeSummary from '../../lib/generateChangeSummary'
import getLocationResidentialSummary from '../reactivate/parent/middleware/getLocationResidentialSummary'

export default class ConfirmController extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getLocationResidentialSummary)
    this.use(getPrisonResidentialSummary)
  }

  generateChangeSummary(oldVal: number, newVal: number, overallVal: number): string | null {
    if (newVal === oldVal) return null

    const verb = newVal > oldVal ? 'increasing' : 'decreasing'
    const diff = newVal - oldVal

    return `\
      You are ${verb} the cell’s working capacity by ${Math.abs(diff)}.
      <br/><br/>
      ${generateChangeSummary('total working capacity', oldVal, newVal, overallVal)}
    `.replace(/^\s*|\s*$/gm, '')
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    const { locationResidentialSummary, prisonResidentialSummary } = res.locals
    const { parentLocation } = locationResidentialSummary

    locals.changeSummary = this.generateChangeSummary(
      parentLocation.capacity.workingCapacity,
      parentLocation.currentCellCertificate.workingCapacity,
      prisonResidentialSummary.prisonSummary.workingCapacity,
    )
    locals.buttonText = 'Update cell capacity'

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { parentLocation } = res.locals.locationResidentialSummary
    const { locationsService } = req.services
    const { systemToken } = req.session

    try {
      await locationsService.updateCapacity(systemToken, parentLocation.id, {
        ...parentLocation.capacity,
        workingCapacity: parentLocation.currentCellCertificate.workingCapacity,
        temporaryWorkingCapacityChange: true,
      })

      req.services.analyticsService.sendEvent(req, 'working_capacity_match_certificate', {
        prison_id: parentLocation.prisonId,
      })
    } catch (e) {
      next(e)
      return
    }

    next()
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, prisonId, pathHierarchy } = res.locals.location

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Capacity updated',
      content: `You have updated the capacity for ${pathHierarchy}.`,
    })
    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
