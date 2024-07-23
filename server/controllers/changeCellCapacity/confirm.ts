import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../utils/backUrl'

export default class ConfirmCellCapacity extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getResidentialSummary)
  }

  async getResidentialSummary(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { user } = res.locals
    const { locationsService } = req.services

    const token = await req.services.authService.getSystemClientToken(user.username)
    res.locals.residentialSummary = await locationsService.getResidentialSummary(token, res.locals.location.prisonId)

    next()
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

  locals(req: FormWizard.Request, res: Response): object {
    const { location } = res.locals
    const { maxCapacity, workingCapacity } = location.capacity

    const newWorkingCap = Number(req.sessionModel.get('workingCapacity'))
    const newMaxCap = Number(req.sessionModel.get('maxCapacity'))
    const { residentialSummary } = res.locals

    const changeSummaries = compact([
      this.generateChangeSummary(
        'working capacity',
        workingCapacity,
        newWorkingCap,
        residentialSummary.prisonSummary.workingCapacity,
      ),
      this.generateChangeSummary(
        'maximum capacity',
        maxCapacity,
        newMaxCap,
        residentialSummary.prisonSummary.maxCapacity,
      ),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    const backLink = backUrl(req, { fallbackUrl: `/location/${location.id}/change-cell-capacity` })

    return {
      backLink,
      cancelLink: `/location/${location.id}/change-cell-capacity/cancel`,
      changeSummary,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { user } = res.locals
      const { locationsService } = req.services

      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.updateCapacity(
        token,
        res.locals.location.id,
        Number(req.sessionModel.get('maxCapacity')),
        Number(req.sessionModel.get('workingCapacity')),
      )

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { id: locationId, localName, pathHierarchy, prisonId } = res.locals.location
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
