import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import { validate as validateUUID } from 'uuid'
import backUrl from '../../../utils/backUrl'
import populateInactiveParentLocations from '../populateInactiveParentLocations'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'

export default class ReactivateCellConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getResidentialSummary)
    this.use(populateInactiveParentLocations)
    this.use(getReferrerRootUrl)
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

    const verb = newVal > oldVal ? 'increase' : 'decrease'
    const diff = newVal - oldVal
    const newOverallVal = overallVal + diff

    return `\
      The establishment's total ${valName} will ${verb} from ${overallVal} to ${newOverallVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  locals(req: FormWizard.Request, res: Response): object {
    const { location, referrerRootUrl } = res.locals
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

    const backLink = backUrl(req, { fallbackUrl: `/reactivate/cell/${location.id}/details` })

    return {
      backLink,
      cancelLink: referrerRootUrl,
      changeSummary,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    try {
      const { location, user } = res.locals
      const { locationsService } = req.services
      const workingCapacity = Number(req.sessionModel.get('workingCapacity'))
      const maxCapacity = Number(req.sessionModel.get('maxCapacity'))

      const token = await req.services.authService.getSystemClientToken(user.username)
      await locationsService.reactivateCell(token, res.locals.location.id, { maxCapacity, workingCapacity })

      req.services.analyticsService.sendEvent(req, 'reactivate_cell', { prison_id: location.prisonId })

      next()
    } catch (error) {
      next(error)
    }
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { displayName, id: locationId, locationType, prisonId } = res.locals.location
    const referrerFlow = req.sessionModel.get<string>('referrerFlow')
    const referrerPrisonId = req.sessionModel.get<string>('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get<string>('referrerLocationId')

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${locationType} activated`,
      content: `You have activated ${displayName}.`,
    })

    if (referrerFlow === 'parent' && validateUUID(referrerLocationId)) {
      res.redirect(`/view-and-update-locations/${encodeURIComponent(referrerPrisonId)}/${referrerLocationId}`)
      return
    }

    if (referrerFlow === 'inactive-cells') {
      if (validateUUID(referrerLocationId)) {
        res.redirect(`/inactive-cells/${encodeURIComponent(referrerPrisonId)}/${referrerLocationId}`)
        return
      }

      res.redirect(`/inactive-cells/${encodeURIComponent(referrerPrisonId)}`)
      return
    }

    res.redirect(`/view-and-update-locations/${prisonId}/${locationId}`)
  }
}
