import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../../utils/backUrl'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import getCellCount from '../../../middleware/getCellCount'
import getResidentialSummary from '../../../middleware/getResidentialSummary'

export default class DeactivateTemporaryConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummary)
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

  // eslint-disable-next-line no-underscore-dangle
  async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { authService, locationsService } = req.services
    const token = await authService.getSystemClientToken(user.username)
    const { deactivationReason, deactivationReasonOther, deactivationReasonDescription } = req.form.values

    res.locals.deactivationReason = await locationsService.getDeactivatedReason(token, deactivationReason as string)

    if (deactivationReason === 'OTHER') {
      res.locals.deactivationReason += ` - ${deactivationReasonOther}`
    } else if (deactivationReasonDescription) {
      res.locals.deactivationReason += ` - ${deactivationReasonDescription}`
    }

    // eslint-disable-next-line no-underscore-dangle
    await super._locals(req, res, next)
  }

  locals(req: FormWizard.Request, res: Response) {
    const { cellCount, location, residentialSummary } = res.locals
    const { workingCapacity } = location.capacity
    const backLink = backUrl(req, { fallbackUrl: `/location/${location.id}/deactivate/temporary/details` })
    const changeSummary = this.generateChangeSummary(
      cellCount,
      workingCapacity,
      residentialSummary.prisonSummary.workingCapacity,
    )

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${location.prisonId}/${location.id}`,
      changeSummary,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user, location } = res.locals

    try {
      const { locationsService } = req.services

      const token = await req.services.authService.getSystemClientToken(user.username)
      const reason = req.sessionModel.get('deactivationReason') as string
      await locationsService.deactivateTemporary(
        token,
        location.id,
        reason,
        req.sessionModel.get(`deactivationReason${reason === 'OTHER' ? 'Other' : 'Description'}`) as string,
        req.sessionModel.get('estimatedReactivationDate') as string,
        req.sessionModel.get('planetFmReference') as string,
      )

      req.services.analyticsService.sendEvent(req, 'deactivate_temp', {
        prison_id: location.prisonId,
        location_type: location.locationType,
        deactivation_reason: reason,
      })

      return next()
    } catch (error) {
      if (error.data?.errorCode === 109) {
        return res.redirect(`/location/${location.id}/deactivate/occupied`)
      }
      return next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { location } = res.locals
    const { displayName, id: locationId, locationType, prisonId } = location as DecoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} deactivated`,
      content: `You have deactivated ${displayName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
