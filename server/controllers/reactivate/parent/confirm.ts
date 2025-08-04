import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../../utils/backUrl'
import { Location, LocationType } from '../../../data/types/locationsApi'
import LocationsService from '../../../services/locationsService'
import populateInactiveParentLocations from '../populateInactiveParentLocations'
import getResidentialSummaries from './middleware/getResidentialSummaries'
import populateLocationTree from './middleware/populateLocationTree'
import nonOxfordJoin from '../../../formatters/nonOxfordJoin'

export default class ReactivateParentConfirm extends FormWizard.Controller {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummaries)
    this.use(populateLocationTree(false))
    this.use(populateInactiveParentLocations)
    this.use(this.stripInactiveSelectedLoctaions)
  }

  stripInactiveSelectedLoctaions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const selectedLocationIds = req.sessionModel.get<string[]>('selectLocations') || []
    const { inactiveParentLocations } = res.locals

    res.locals.inactiveParentLocations = inactiveParentLocations.filter(l => !selectedLocationIds.includes(l.id))

    next()
  }

  generateChangeSummary(valName: string, oldVal: number, newVal: number): string | null {
    if (newVal === oldVal) return null

    const verb = newVal > oldVal ? 'increase' : 'decrease'

    return `\
      The establishment’s total ${valName} capacity will ${verb} from ${oldVal} to ${newVal}.
    `.replace(/^\s*|\s*$/gm, '')
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { cells, decoratedLocation, prisonResidentialSummary } = res.locals
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const backLink = backUrl(req, { fallbackUrl: `/reactivate/parent/${decoratedLocation.id}/check-capacity` })
    const cancelLink = `/inactive-cells/${[referrerPrisonId, referrerLocationId].filter(i => i).join('/')}`
    const { maxCapacity, workingCapacity } = prisonResidentialSummary.prisonSummary
    let newMaxCapacity = maxCapacity
    let newWorkingCapacity = workingCapacity

    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    cells.forEach(cell => {
      const changes = capacityChanges[cell.id] || {}
      const originalCellMaxCapacity = cell.capacity.maxCapacity
      const originalCellWorkingCapacity = cell.oldWorkingCapacity
      const newCellMaxCapacity =
        'maxCapacity' in changes && req.canAccess('change_max_capacity') ? changes.maxCapacity : originalCellMaxCapacity
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

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { cells, locationResidentialSummary } = res.locals
    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    const allCellChanges = Object.fromEntries(
      cells
        .map((cell: Location) => {
          const changes = capacityChanges[cell.id]
          if (!changes) {
            return null
          }

          if (!req.canAccess('change_max_capacity')) {
            delete changes.maxCapacity
          }

          const newCapacity = {
            workingCapacity: cell?.oldWorkingCapacity,
            maxCapacity: cell?.capacity?.maxCapacity,
            ...changes,
          }
          if (
            newCapacity.workingCapacity === cell?.oldWorkingCapacity &&
            newCapacity.maxCapacity === cell?.capacity?.maxCapacity
          ) {
            return null
          }

          return [
            cell.id,
            {
              capacity: newCapacity,
            },
          ]
        })
        .filter(e => e),
    ) as Parameters<LocationsService['reactivateBulk']>[1]
    let selectedLocationIds = req.sessionModel.get<string[]>('selectLocations')
    if (!selectedLocationIds?.length) {
      selectedLocationIds = locationResidentialSummary.subLocations.map(l => l.id)
    }

    const { locationsService } = req.services
    await locationsService.reactivateBulk(systemToken, {
      ...Object.fromEntries(selectedLocationIds.map(id => [id, { cascadeReactivation: true }])),
      ...allCellChanges,
    })

    next()
  }

  override async successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { decoratedLocation, locationResidentialSummary, locationTree } = res.locals
    const redirectUrl = `/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`

    const selectLocations = req.sessionModel.get<string[]>('selectLocations') || []

    req.journeyModel.reset()
    req.sessionModel.reset()

    let { locationType } = decoratedLocation
    if (selectLocations.length) {
      if (selectLocations.length === 1) {
        const { locationsService } = req.services
        locationType = (await locationsService.getLocationType(
          systemToken,
          locationTree[0].location.locationType,
        )) as LocationType
      } else {
        locationType = locationResidentialSummary.subLocationName as LocationType
      }
    }
    const locationNames = nonOxfordJoin(
      (selectLocations.length ? locationTree.map(l => l.location) : [decoratedLocation]).map(
        l => l.localName || l.pathHierarchy,
      ),
    )

    req.flash('success', {
      title: `${locationType} activated`,
      content: `You have activated ${locationNames}.`,
    })

    res.redirect(redirectUrl)
  }
}
