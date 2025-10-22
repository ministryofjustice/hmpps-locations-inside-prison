import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../utils/backUrl'
import getPrisonResidentialSummary from '../../middleware/getPrisonResidentialSummary'
import { TypedLocals } from '../../@types/express'
import capFirst from '../../formatters/capFirst'

export default class ConfirmCellCapacity extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getPrisonResidentialSummary)
  }

  generateChangeSummary(valName: string, oldVal: number, newVal: number, overallVal: number): string | null {
    if (newVal === oldVal) return null

    const verbs = newVal > oldVal ? ['increasing', 'increase'] : ['decreasing', 'decrease']
    const diff = newVal - oldVal
    const newOverallVal = overallVal + diff

    return `\
      You are ${verbs[0]} the cell’s ${valName} by ${Math.abs(diff)}.
      <br/><br/>
      This will ${verbs[1]} the establishment’s ${valName} from ${overallVal} to ${newOverallVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const { decoratedLocation, values } = res.locals
    const { id: locationId, prisonId } = decoratedLocation
    const { maxCapacity, workingCapacity } = decoratedLocation.capacity

    if (!req.canAccess('change_max_capacity')) {
      req.sessionModel.set('maxCapacity', maxCapacity)
      values.maxCapacity = maxCapacity
    }

    const newWorkingCap = Number(req.sessionModel.get('workingCapacity'))
    const newMaxCap = Number(req.sessionModel.get('maxCapacity'))
    const { prisonResidentialSummary } = res.locals

    const changeSummaries = compact([
      this.generateChangeSummary(
        'working capacity',
        workingCapacity,
        newWorkingCap,
        prisonResidentialSummary.prisonSummary.workingCapacity,
      ),
      this.generateChangeSummary(
        'maximum capacity',
        maxCapacity,
        newMaxCap,
        prisonResidentialSummary.prisonSummary.maxCapacity,
      ),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    const backLink = backUrl(req, { fallbackUrl: `/location/${locationId}/change-cell-capacity/change` })

    return {
      backLink,
      cancelLink: `/view-and-update-locations/${prisonId}/${locationId}`,
      changeSummary,
      title: `Confirm ${req.canAccess('change_max_capacity') ? 'cell' : 'working'} capacity`,
      titleCaption: capFirst(decoratedLocation.displayName),
      buttonText: `Update ${req.canAccess('change_max_capacity') ? 'cell' : 'working'} capacity`,
    }
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { decoratedLocation } = res.locals
      const { locationsService } = req.services

      if (!req.canAccess('change_max_capacity')) {
        req.sessionModel.set('maxCapacity', decoratedLocation.capacity.maxCapacity)
      }

      await locationsService.updateCapacity(
        req.session.systemToken,
        decoratedLocation.id,
        Number(req.sessionModel.get('maxCapacity')),
        Number(req.sessionModel.get('workingCapacity')),
      )

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
      title: 'Capacity updated',
      content: `You have updated the capacity of ${locationName}.`,
    })

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
