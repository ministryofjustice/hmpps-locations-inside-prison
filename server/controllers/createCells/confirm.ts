import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../base/formInitialStep'
import LocationsApiClient from '../../data/locationsApiClient'
import unsetTempValues from '../../middleware/unsetTempValues'

export default class ConfirmCreateCells extends FormInitialStep {
  override middlewareSetup() {
    super.middlewareSetup()
    this.use(unsetTempValues)
  }

  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { services, session, sessionModel } = req
    const { locationId } = res.locals

    const { locationsService } = services
    const { systemToken } = session

    const cellsToCreate = sessionModel.get<string>('create-cells_cellsToCreate')
    const accommodationType = sessionModel.get<string>('create-cells_accommodationType')
    const usedFor = sessionModel.get<string[]>('create-cells_usedFor')

    res.locals.createRootLink = `/create-cells/${locationId}`

    res.locals.summaryListRows = [
      {
        key: { text: 'Number of cells' },
        value: { text: cellsToCreate },
        actions: {
          items: [
            {
              text: 'Change',
              href: `${res.locals.createRootLink}/create-cells/details/edit`,
              classes: 'govuk-link--no-visited-state',
            },
          ],
        },
      },
      {
        key: { text: 'Accommodation type' },
        value: { text: await locationsService.getAccommodationType(systemToken, accommodationType) },
        actions: {
          items: [
            {
              text: 'Change',
              href: `${res.locals.createRootLink}/create-cells/details/edit`,
              classes: 'govuk-link--no-visited-state',
            },
          ],
        },
      },
    ]

    if (usedFor) {
      res.locals.summaryListRows.push({
        key: { text: 'Used for' },
        value: {
          html: (await Promise.all(usedFor.map(s => locationsService.getUsedForType(systemToken, s)))).join('<br>'),
        },
        actions: {
          items: [
            {
              text: 'Change',
              href: `${res.locals.createRootLink}/create-cells/used-for/edit`,
              classes: 'govuk-link--no-visited-state',
            },
          ],
        },
      })
    }

    res.locals.specialistCellTypesObject = await locationsService.getSpecialistCellTypes(systemToken)

    await super._locals(req, res, next)
  }

  override locals(req: FormWizard.Request, res: Response): TypedLocals {
    const locals = super.locals(req, res)

    const { localName, locationType, pathHierarchy } = res.locals.decoratedResidentialSummary.location
    locals.locationPathPrefix = pathHierarchy

    locals.title = `Check and confirm the cell details`
    locals.titleCaption = `Create cells on ${locationType.toLowerCase()} ${localName || pathHierarchy}`
    locals.buttonText = `Create cells`
    locals.cancelText = `Cancel`

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { analyticsService, locationsService } = req.services

    try {
      const { sessionModel } = req
      const { locationId, prisonId } = res.locals

      const cells: Parameters<LocationsApiClient['locations']['createCells']>[2]['cells'] = []

      const cellsToCreate = Number(sessionModel.get<string>('create-cells_cellsToCreate'))
      const bulkSanitation = sessionModel.get<string>('create-cells_bulkSanitation')
      const withoutSanitation = sessionModel.get<string[]>('create-cells_withoutSanitation')

      for (let i = 0; i < cellsToCreate; i += 1) {
        const cellTypes = sessionModel.get<string[]>(`saved-cellTypes${i}`) || []

        cells.push({
          code: sessionModel.get<string>(`create-cells_cellNumber${i}`).padStart(3, '0'),
          cellMark: sessionModel.get<string>(`create-cells_doorNumber${i}`),
          certifiedNormalAccommodation: Number(sessionModel.get<string>(`create-cells_baselineCna${i}`)),
          maxCapacity: Number(sessionModel.get<string>(`create-cells_maximumCapacity${i}`)),
          workingCapacity: Number(sessionModel.get<string>(`create-cells_workingCapacity${i}`)),
          specialistCellTypes: cellTypes,
          inCellSanitation: bulkSanitation === 'YES' || !withoutSanitation.includes(i.toString()),
        })
      }

      await locationsService.createCells(req.session.systemToken, {
        prisonId,
        parentLocation: locationId,
        // newLevelAboveCells: {},
        cellsUsedFor: sessionModel.get<string[]>('create-cells_usedFor'),
        accommodationType: sessionModel.get<string>('create-cells_accommodationType'),
        cells,
      })

      analyticsService.sendEvent(req, `create_cells`, {
        prison_id: prisonId,
        location_id: locationId,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override async successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { journeyModel, sessionModel } = req
    const { decoratedResidentialSummary } = res.locals
    const { location } = decoratedResidentialSummary

    const cellsToCreate = Number(sessionModel.get<string>('create-cells_cellsToCreate'))

    journeyModel.reset()
    sessionModel.reset()

    const content = `You have created ${cellsToCreate} cells on ${location.locationType.toLowerCase()} ${location.localName || location.pathHierarchy}.`

    req.flash('success', {
      title: `Cells created`,
      content,
    })

    res.redirect(`/view-and-update-locations/${location.prisonId}/${location.id}`)
  }
}
