import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import getCellCount from '../../../middleware/getCellCount'
import getPrisonResidentialSummary from '../../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../../@types/express'
import paths from '../../../utils/paths'
import DeactivatePermanentBase from './base'

export default class DeactivatePermanentConfirm extends DeactivatePermanentBase {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
    this.use(getCellCount)
  }

  generateChangeSummary(valName: string, locationCap: number, totalCap: number): string | null {
    if (locationCap === 0) return null

    const newTotalCap = totalCap - locationCap

    return `The establishment’s ${valName} will reduce from ${totalCap} to ${newTotalCap}.`
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { cellCount, decoratedLocation, prisonResidentialSummary } = res.locals
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity
    const { maxCapacity: totalMaxCap, workingCapacity: totalWorkingCap } = prisonResidentialSummary.prisonSummary

    const changeSummaries = compact([
      this.generateChangeSummary('working capacity', workingCapacity, totalWorkingCap),
      this.generateChangeSummary('maximum capacity', maxCapacity, totalMaxCap),
    ])

    const changeSummary = `
      You are archiving ${cellCount} cell${cellCount > 1 ? 's' : ''}.
      <br/><br/>
      ${changeSummaries.join('\n<br/><br/>\n')}
    `.replace(/^\s*|\s*$/gm, '')

    const deactivationReason = req.sessionModel.get<string>('permanentDeactivationReason')

    return {
      changeSummary,
      deactivationReason,
      buttonText: 'Confirm deactivation',
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const reason = req.sessionModel.get('permanentDeactivationReason') as string
      await locationsService.deactivatePermanent(req.session.systemToken, decoratedLocation.id, reason)

      analyticsService.sendEvent(req, 'deactivate_perm', {
        prison_id: decoratedLocation.prisonId,
        location_type: decoratedLocation.locationType,
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
    const { displayName, prisonId } = decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Location archived',
      content: `You have permanently deactivated ${displayName}.`,
    })

    res.redirect(paths.prison.archivedLocations(prisonId))
  }
}
