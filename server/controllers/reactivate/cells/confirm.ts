import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../../utils/backUrl'
import { Location, ResidentialSummary } from '../../../data/types/locationsApi'
import populateCells from './populateCells'
import LocationsService from '../../../services/locationsService'
import populateInactiveParentLocations from '../populateInactiveParentLocations'
import { PrisonResidentialSummary } from '../../../data/types/locationsApi/prisonResidentialSummary'

export default class ReactivateCellsConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.getPrisonResidentialSummary)
    this.use(populateCells)
    this.use(populateInactiveParentLocations)
  }

  async getPrisonResidentialSummary(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services

    res.locals.prisonResidentialSummary = await locationsService.getResidentialSummary(
      systemToken,
      req.sessionModel.get('referrerPrisonId') as string,
    )

    next()
  }

  generateChangeSummary(valName: string, oldVal: number, newVal: number): string | null {
    if (newVal === oldVal) return null

    const verb = newVal > oldVal ? 'increase' : 'decrease'

    return `\
      The establishment’s total ${valName} capacity will ${verb} from ${oldVal} to ${newVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  locals(req: FormWizard.Request, res: Response) {
    const { cells, prisonResidentialSummary } = res.locals
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const backLink = backUrl(req, { fallbackUrl: '/reactivate/cells/check-capacity' })
    const cancelLink = `/inactive-cells/${[referrerPrisonId, referrerLocationId].filter(i => i).join('/')}`
    const { maxCapacity, workingCapacity } = prisonResidentialSummary.prisonSummary
    let newMaxCapacity = maxCapacity
    let newWorkingCapacity = workingCapacity

    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    cells.forEach((cell: Location) => {
      const changes = capacityChanges[cell.id] || {}
      const originalCellMaxCapacity = cell.capacity.maxCapacity
      const originalCellWorkingCapacity = cell.oldWorkingCapacity
      const newCellMaxCapacity = 'maxCapacity' in changes ? changes.maxCapacity : originalCellMaxCapacity
      const newCellWorkingCapacity =
        'workingCapacity' in changes ? changes.workingCapacity : originalCellWorkingCapacity
      newMaxCapacity += newCellMaxCapacity - originalCellMaxCapacity
      newWorkingCapacity += newCellWorkingCapacity
    })

    const changeSummaries = compact([
      this.generateChangeSummary('working', workingCapacity, newWorkingCapacity),
      this.generateChangeSummary('maximum', maxCapacity, newMaxCapacity),
    ])

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')

    return {
      backLink,
      cancelLink,
      changeSummary,
    }
  }

  async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { cells, user } = res.locals
    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    const selectedLocations: string[] = req.sessionModel.get('selectedLocations') as string[]
    const allCellChanges = Object.fromEntries(
      selectedLocations.map((id: string) => {
        const location = cells.find(l => l.id === id)

        return [
          id,
          {
            capacity: {
              workingCapacity: location?.oldWorkingCapacity,
              maxCapacity: location?.capacity?.maxCapacity,
              ...capacityChanges[id],
            },
          },
        ]
      }),
    ) as Parameters<LocationsService['reactivateBulk']>[1]

    const { locationsService } = req.services
    await locationsService.reactivateBulk(systemToken, allCellChanges)

    req.services.analyticsService.sendEvent(req, 'reactivate_cells', { prison_id: user.activeCaseload?.id })

    next()
  }

  successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const redirectUrl = `/inactive-cells/${[referrerPrisonId, referrerLocationId].filter(i => i).join('/')}`

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `Cells activated`,
      content: `You have activated ${res.locals.cells.length} cells.`,
    })

    res.redirect(redirectUrl)
  }
}
