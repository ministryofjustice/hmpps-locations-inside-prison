import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import getCellCount from '../../../middleware/getCellCount'
import getResidentialSummary from '../../../middleware/getResidentialSummary'
import protectRoute from '../../../middleware/protectRoute'

export default class DeactivatePermanentConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(protectRoute('deactivate:permanent'))
    this.use(getResidentialSummary)
    this.use(getCellCount)
  }

  generateChangeSummary(valName: string, locationCap: number, totalCap: number): string | null {
    if (locationCap === 0) return null

    const newTotalCap = totalCap - locationCap

    return `The establishment’s ${valName} will reduce from ${totalCap} to ${newTotalCap}.`
  }

  locals(req: FormWizard.Request, res: Response) {
    const { cellCount, location, residentialSummary } = res.locals
    const { maxCapacity, workingCapacity } = location.capacity
    const { maxCapacity: totalMaxCap, workingCapacity: totalWorkingCap } = residentialSummary.prisonSummary

    const changeSummaries = compact([
      this.generateChangeSummary('working capacity', workingCapacity, totalWorkingCap),
      this.generateChangeSummary('maximum capacity', maxCapacity, totalMaxCap),
    ])

    const changeSummary = `
      You are archiving ${cellCount} cell${cellCount > 1 ? 's' : ''}.
      <br/><br/>
      ${changeSummaries.join('\n<br/><br/>\n')}
    `.replace(/^\s*|\s*$/gm, '')

    const permanentDeactivationReason = req.sessionModel.get<string>('permanentDeactivationReason')

    return {
      cancelLink: `/view-and-update-locations/${location.prisonId}/${location.id}`,
      changeSummary,
      permanentDeactivationReason,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user, location } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const token = await req.services.authService.getSystemClientToken(user.username)
      const reason = req.sessionModel.get('permanentDeactivationReason') as string
      await locationsService.deactivatePermanent(token, location.id, reason)

      analyticsService.sendEvent(req, 'deactivate_perm', {
        prison_id: location.prisonId,
        location_type: location.locationType,
      })

      return next()
    } catch (error) {
      if (error.data?.errorCode === 109) {
        analyticsService.sendEvent(req, 'handled_error', {
          prison_id: location.prisonId,
          error_code: 109,
        })

        return res.redirect(`/location/${location.id}/deactivate/occupied`)
      }
      return next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { displayName, id: locationId, prisonId } = location as DecoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Location archived',
      content: `You have permanently deactivated ${displayName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
