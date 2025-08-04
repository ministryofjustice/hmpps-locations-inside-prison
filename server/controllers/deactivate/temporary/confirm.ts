import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../../utils/backUrl'
import getCellCount from '../../../middleware/getCellCount'
import getPrisonResidentialSummary from '../../../middleware/getPrisonResidentialSummary'

export default class DeactivateTemporaryConfirm extends FormWizard.Controller {
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

  // eslint-disable-next-line no-underscore-dangle
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

    // eslint-disable-next-line no-underscore-dangle
    await super._locals(req, res, next)
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { cellCount, decoratedLocation, prisonResidentialSummary } = res.locals
    const { workingCapacity } = decoratedLocation.capacity
    const backLink = backUrl(req, { fallbackUrl: `/location/${decoratedLocation.id}/deactivate/temporary/details` })
    const changeSummary = this.generateChangeSummary(
      cellCount,
      workingCapacity,
      prisonResidentialSummary.prisonSummary.workingCapacity,
    )

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`,
      changeSummary,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { analyticsService, locationsService } = req.services

    try {
      const reason = req.sessionModel.get('deactivationReason') as string
      await locationsService.deactivateTemporary(
        req.session.systemToken,
        decoratedLocation.id,
        reason,
        req.sessionModel.get(`deactivationReason${reason === 'OTHER' ? 'Other' : 'Description'}`) as string,
        req.sessionModel.get('estimatedReactivationDate') as string,
        req.sessionModel.get('planetFmReference') as string,
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

        return res.redirect(`/location/${decoratedLocation.id}/deactivate/occupied`)
      }
      return next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { decoratedLocation } = res.locals
    const { displayName, id: locationId, locationType, prisonId } = decoratedLocation

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} deactivated`,
      content: `You have deactivated ${displayName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
