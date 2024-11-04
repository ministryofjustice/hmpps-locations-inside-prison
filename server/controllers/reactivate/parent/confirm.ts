import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import backUrl from '../../../utils/backUrl'
import { Location, ResidentialSummary } from '../../../data/types/locationsApi'
import LocationsService from '../../../services/locationsService'
import populateInactiveParentLocations from '../populateInactiveParentLocations'
import { DecoratedLocation } from '../../../decorators/decoratedLocation'
import getResidentialSummaries from './middleware/getResidentialSummaries'
import populateLocations, { LocationMap } from './middleware/populateLocations'
import { PrisonResidentialSummary } from '../../../data/types/locationsApi/prisonResidentialSummary'
import { LocationResidentialSummary } from '../../../data/types/locationsApi/locationResidentialSummary'
import nonOxfordJoin from '../../../formatters/nonOxfordJoin'

export default class ReactivateParentConfirm extends FormWizard.Controller {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummaries)
    this.use(populateLocations(false))
    this.use(populateInactiveParentLocations)
    this.use(this.stripInactiveSelectedLoctaions)
  }

  stripInactiveSelectedLoctaions(req: FormWizard.Request, res: Response, next: NextFunction) {
    const selectedLocationIds = req.sessionModel.get<string[]>('selectLocations') || []
    const { inactiveParentLocations }: { inactiveParentLocations: DecoratedLocation[] } = res.locals as unknown as {
      inactiveParentLocations: DecoratedLocation[]
    }

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

  locals(req: FormWizard.Request, res: Response) {
    const {
      cells,
      location,
      prisonResidentialSummary,
    }: { cells: DecoratedLocation[]; location: DecoratedLocation; prisonResidentialSummary: PrisonResidentialSummary } =
      res.locals as unknown as {
        cells: DecoratedLocation[]
        location: DecoratedLocation
        prisonResidentialSummary: PrisonResidentialSummary
      }
    const referrerPrisonId = req.sessionModel.get('referrerPrisonId')
    const referrerLocationId = req.sessionModel.get('referrerLocationId')
    const backLink = backUrl(req, { fallbackUrl: `/reactivate/parent/${location.id}/check-capacity` })
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
    const {
      cells,
      locationResidentialSummary,
      user,
    }: { cells?: Location[]; locationResidentialSummary: ResidentialSummary; user: Express.User } =
      res.locals as unknown as {
        cells?: Location[]
        locationResidentialSummary: ResidentialSummary
        user: Express.User
      }
    const capacityChanges: { [id: string]: Partial<Location['capacity']> } = (req.sessionModel.get('capacityChanges') ||
      {}) as typeof capacityChanges
    const allCellChanges = Object.fromEntries(
      cells
        .map((cell: Location) => {
          const changes = capacityChanges[cell.id]
          if (!changes) {
            return null
          }

          return [
            cell.id,
            {
              capacity: {
                workingCapacity: cell?.oldWorkingCapacity,
                maxCapacity: cell?.capacity?.maxCapacity,
                ...capacityChanges[cell.id],
              },
            },
          ]
        })
        .filter(e => e),
    ) as Parameters<LocationsService['reactivateBulk']>[1]
    let selectedLocationIds = req.sessionModel.get<string[]>('selectLocations')
    if (!selectedLocationIds?.length) {
      selectedLocationIds = locationResidentialSummary.subLocations.map(l => l.id)
    }

    const { authService, locationsService } = req.services
    const token = await authService.getSystemClientToken(user.username)
    await locationsService.reactivateBulk(token, {
      ...Object.fromEntries(selectedLocationIds.map(id => [id, { cascadeReactivation: true }])),
      ...allCellChanges,
    })

    next()
  }

  async successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const {
      location,
      locationResidentialSummary,
      locations,
      user,
    }: {
      location: DecoratedLocation
      locationResidentialSummary: LocationResidentialSummary
      locations: LocationMap[]
      user: Express.User
    } = res.locals as unknown as {
      location: DecoratedLocation
      locationResidentialSummary: LocationResidentialSummary
      locations: LocationMap[]
      user: Express.User
    }
    const redirectUrl = `/view-and-update-locations/${location.prisonId}/${location.id}`

    const selectLocations = req.sessionModel.get<string[]>('selectLocations') || []

    req.journeyModel.reset()
    req.sessionModel.reset()

    let { locationType } = location
    if (selectLocations.length) {
      if (selectLocations.length === 1) {
        const { authService, locationsService } = req.services
        const systemToken = await authService.getSystemClientToken(user.username)
        locationType = await locationsService.getLocationType(systemToken, locations[0].location.locationType)
      } else {
        locationType = locationResidentialSummary.subLocationName
      }
    }
    const locationNames = nonOxfordJoin(
      (selectLocations.length ? locations.map(l => l.location) : [location]).map(l => l.localName || l.pathHierarchy),
    )

    req.flash('success', {
      title: `${locationType} activated`,
      content: `You have activated ${locationNames}.`,
    })

    res.redirect(redirectUrl)
  }
}
