import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import backUrl from '../../utils/backUrl'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'
import LocationsService from '../../services/locationsService'

export default class ConfirmWorkingCapacity extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  generateChangeSummary(oldVal: number, newVal: number, overallVal: number): string | null {
    if (newVal === oldVal) return null

    const verbs = newVal > oldVal ? ['increasing', 'increase'] : ['decreasing', 'decrease']
    const diff = newVal - oldVal
    const newOverallVal = overallVal + diff

    return `\
      You are ${verbs[0]} the cell's working capacity by ${Math.abs(diff)}.
      <br/><br/>
      This will ${verbs[1]} the establishment's working capacity from ${overallVal} to ${newOverallVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { workingCapacity } = decoratedLocation.capacity

    const newWorkingCap = Number(req.sessionModel.get('workingCapacity'))
    const { prisonResidentialSummary } = res.locals

    const changeSummary = this.generateChangeSummary(
      workingCapacity,
      newWorkingCap,
      prisonResidentialSummary.prisonSummary.workingCapacity,
    )

    const backLink = backUrl(req, { fallbackUrl: `/location/${locationId}/change-cell-capacity/change` })

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
      title: `Do you want to update certified working capacity?`,
      titleCaption: capFirst(decoratedLocation.displayName),
      buttonText: `Update certified working capacity`,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      const capacities: Parameters<LocationsService['updateCapacity']>[2] = {
        workingCapacity: Number(req.sessionModel.get('workingCapacity')),
        maxCapacity: Number(req.sessionModel.get('maxCapacity')),
      }

      if (!res.locals.fields.baselineCna.removed) {
        capacities.certifiedNormalAccommodation = Number(req.sessionModel.get('baselineCna'))
      }

      await locationsService.updateCapacity(req.session.systemToken, decoratedLocation.id, capacities)

      req.services.analyticsService.sendEvent(req, 'change_cell_capacity', { prison_id: decoratedLocation.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  override successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { id: locationId, localName, pathHierarchy, prisonId } = res.locals.decoratedLocation
    const locationName = localName || pathHierarchy

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: 'Working capacity updated',
      content: `You have updated the working capacity of ${locationName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
