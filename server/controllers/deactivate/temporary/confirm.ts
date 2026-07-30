import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import getCellCount from '../../../middleware/getCellCount'
import getPrisonResidentialSummary from '../../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../../@types/express'
import paths from '../../../utils/paths'
import FormStep from '../../base/formStep'

export default class DeactivateTemporaryConfirm extends FormStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(getCellCount)
  }

  generateChangeSummary(cellCount: number, cellWorkingCapacity: number, overallWorkingCapacity: number): string | null {
    if (cellWorkingCapacity === 0) return null

    const newOverallVal = overallWorkingCapacity - cellWorkingCapacity

    return `\
      You are making ${cellCount} cell${cellCount > 1 ? 's' : ''} inactive.
      <br/><br/>
      This will reduce the establishment's total working capacity from ${overallWorkingCapacity} to ${newOverallVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services
    const { deactivationReason, deactivationReasonOther, deactivationReasonDescription } = req.form.values

    res.locals.deactivationReason = await locationsService.getDeactivatedReason(
      systemToken,
      deactivationReason as string,
    )

    if (deactivationReason === 'OTHER') {
      res.locals.deactivationReason += ` - ${deactivationReasonOther}`
    } else if (deactivationReasonDescription) {
      res.locals.deactivationReason += ` - ${deactivationReasonDescription}`
    }

    await super._locals(req, res, next)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { cellCount, decoratedLocation, prisonResidentialSummary } = res.locals
    const { workingCapacity } = decoratedLocation.capacity
    const changeSummary =
      this.generateChangeSummary(cellCount, workingCapacity, prisonResidentialSummary.prisonSummary.workingCapacity) ||
      "There will be no change to the establishment's capacity."

    return {
      changeSummary,
      buttonText: 'Confirm deactivation',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const reason = req.sessionModel.get<string>('deactivationReason')
      await locationsService.deactivateTemporary(
        req.session.systemToken,
        decoratedLocation.id,
        reason,
        req.sessionModel.get<string>(`deactivationReason${reason === 'OTHER' ? 'Other' : 'Description'}`),
        req.sessionModel.get<string>('estimatedReactivationDate') ||
          req.sessionModel.get<string>('mandatoryEstimatedReactivationDate'),
        req.sessionModel.get<string>('planetFmReference'),
      )

      analyticsService.sendEvent(req, 'deactivate_temp', {
        prison_id: decoratedLocation.prisonId,
        location_type: decoratedLocation.locationType,
        deactivation_reason: reason,
      })

      return next()
    } catch (error) {
      if (error.data?.errorCode === 109) {
        analyticsService.sendEvent(req, 'handled_error', {
          prison_id: decoratedLocation.prisonId,
          error_code: 109,
        })

        return res.redirect(`${paths.location.deactivate(decoratedLocation)}/occupied`)
      }

      return next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { displayName, locationType } = decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} deactivated`,
      content: `You have deactivated ${displayName}.`,
    })

    res.redirect(paths.location.view(decoratedLocation))
  }
}
