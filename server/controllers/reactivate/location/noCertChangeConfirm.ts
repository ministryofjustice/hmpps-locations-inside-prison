import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { compact } from 'lodash'
import { Location } from '../../../data/types/locationsApi'
import LocationsService from '../../../services/locationsService'
import populateInactiveParentLocations from '../populateInactiveParentLocations'
import populateLocationTree from '../parent/middleware/populateLocationTree'
import getResidentialSummaries from '../parent/middleware/getResidentialSummaries'
import populateModifiedLocationMap from './middleware/populateModifiedLocationMap'
import capFirst from '../../../formatters/capFirst'
import FormInitialStep from '../../base/formInitialStep'
import { TypedLocals } from '../../../@types/express'

export default class NoCertChangeConfirm extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(getResidentialSummaries)
    this.use(populateLocationTree(false))
    this.use(populateInactiveParentLocations)
    this.use(populateModifiedLocationMap)
  }

  generateChangeSummary(valName: string, oldVal: number, newVal: number): string | null {
    if (newVal === oldVal) return null

    const verb = newVal > oldVal ? 'increase' : 'decrease'

    return `The establishment’s total ${valName} will ${verb} from ${oldVal} to ${newVal}.`
  }

  override locals(req: FormWizard.Request, res: Response) {
    const { cells, prisonResidentialSummary, modifiedLocationMap, decoratedLocation } = res.locals
    const { maxCapacity: establishmentMaxCapacity, workingCapacity: establishmentWorkingCapacity } =
      prisonResidentialSummary.prisonSummary
    const establishmentCna =
      prisonResidentialSummary.prisonSummary.currentCertificate?.totalCertifiedNormalAccommodation || 0
    let newEstablishmentMaxCapacity = establishmentMaxCapacity
    let newEstablishmentWorkingCapacity = establishmentWorkingCapacity
    let newEstablishmentCna = establishmentCna

    cells.forEach(cell => {
      const modifiedLocation = modifiedLocationMap[cell.id]
      const originalCellMaxCapacity = cell.capacity.maxCapacity
      const originalCellWorkingCapacity = cell.capacity.workingCapacity
      const originalCellCna = cell.capacity.certifiedNormalAccommodation
      const newCellMaxCapacity = modifiedLocation.capacity.maxCapacity
      const newCellWorkingCapacity = modifiedLocation.oldWorkingCapacity
      const newCellCna = modifiedLocation.capacity.certifiedNormalAccommodation
      newEstablishmentMaxCapacity += newCellMaxCapacity - originalCellMaxCapacity
      newEstablishmentWorkingCapacity += newCellWorkingCapacity - originalCellWorkingCapacity
      newEstablishmentCna += newCellCna - originalCellCna
    })

    const changeSummaries = compact([
      this.generateChangeSummary('certified normal accommodation', establishmentCna, newEstablishmentCna),
      this.generateChangeSummary('working capacity', establishmentWorkingCapacity, newEstablishmentWorkingCapacity),
      this.generateChangeSummary('maximum capacity', establishmentMaxCapacity, newEstablishmentMaxCapacity),
    ])

    if (changeSummaries.length === 0) {
      changeSummaries.push("There will be no change to the establishment's capacity.")
    }

    const changeSummary = changeSummaries.join('\n<br/><br/>\n')
    const locals: TypedLocals = {
      changeSummary,
      buttonText: 'Confirm activation',
    }

    if (decoratedLocation.leafLevel) {
      locals.title = `You are about to reactivate ${decoratedLocation.pathHierarchy}`
    } else {
      locals.title = `You are about to reactivate ${cells.length} cell${cells.length > 1 ? 's' : ''}`
      locals.titleCaption = capFirst(decoratedLocation.displayName)
    }

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { systemToken } = req.session
    const { locationsService } = req.services
    const { cells, modifiedLocationMap } = res.locals
    const { decoratedLocation } = res.locals
    const allCellChanges = Object.fromEntries(
      cells
        .map((cell: Location) => {
          const modifiedLocation = modifiedLocationMap[cell.id]

          const newCapacity = {
            workingCapacity: modifiedLocation.oldWorkingCapacity,
            maxCapacity: modifiedLocation.capacity.maxCapacity,
            certifiedNormalAccommodation: modifiedLocation.capacity.certifiedNormalAccommodation,
          }
          if (
            newCapacity.workingCapacity === cell.oldWorkingCapacity &&
            newCapacity.maxCapacity === cell.capacity.maxCapacity &&
            newCapacity.certifiedNormalAccommodation === cell.capacity.certifiedNormalAccommodation
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

    await locationsService.reactivateBulk(
      systemToken,
      {
        [decoratedLocation.id]: { cascadeReactivation: true },
        ...allCellChanges,
      },
      true,
    )

    next()
  }

  override async successHandler(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { decoratedLocation } = res.locals
    const redirectUrl = `/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${decoratedLocation.locationType} activated`,
      content: `You have activated ${decoratedLocation.displayName}.`,
    })

    res.redirect(redirectUrl)
  }
}
