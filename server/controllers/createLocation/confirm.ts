import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { capitalize } from 'lodash'
import { TypedLocals } from '../../@types/express'
import FormInitialStep from '../base/formInitialStep'
import { Location, LocationType } from '../../data/types/locationsApi'
import pluralize from '../../formatters/pluralize'
import decorateLocation from '../../decorators/location'
import nonOxfordJoin from '../../formatters/nonOxfordJoin'
import LocationsApiClient from '../../data/locationsApiClient'

export default class ConfirmCreateLocation extends FormInitialStep {
  // eslint-disable-next-line no-underscore-dangle
  override async _locals(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { services, session, sessionModel } = req
    const createCellsNow = sessionModel.get<string>('createCellsNow')
    const { locationId } = res.locals

    if (createCellsNow === 'YES') {
      const { locationsService } = services
      const { systemToken } = session

      const cellsToCreate = sessionModel.get<string>('create-cells_cellsToCreate')
      const accommodationType = sessionModel.get<string>('create-cells_accommodationType')
      const usedFor = sessionModel.get<string[]>('create-cells_usedFor')

      res.locals.createRootLink = `/create-new/${locationId}`

      res.locals.summaryListRows = [
        {
          key: { text: 'Number of cells' },
          value: { text: cellsToCreate },
          actions: {
            items: [
              {
                text: 'Change',
                href: `${res.locals.createRootLink}/create-cells`,
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
                href: `${res.locals.createRootLink}/create-cells`,
              },
            ],
          },
        },
      ]

      if (usedFor) {
        res.locals.summaryListRows.push({
          key: { text: 'Used for' },
          value: {
            text: (await Promise.all(usedFor.map(s => locationsService.getUsedForType(systemToken, s)))).join(', '),
          },
          actions: {
            items: [
              {
                text: 'Change',
                href: `${res.locals.createRootLink}/create-cells/used-for/edit`,
              },
            ],
          },
        })
      }

      res.locals.specialistCellTypesObject = await locationsService.getSpecialistCellTypes(systemToken)
    }

    // eslint-disable-next-line no-underscore-dangle
    await super._locals(req, res, next)
  }

  override locals(req: FormWizard.Request, res: Response): Partial<TypedLocals> {
    const locals = super.locals(req, res)
    const { prisonId, locationId, values } = res.locals
    const { locationType, structureLevels } = values

    locals.locationType = req.sessionModel.get<LocationType>('locationType')

    locals.createDetailsLink = `/create-new/${locationId || prisonId}/details`

    if (structureLevels?.length) {
      const fullStructure = [locationType, ...structureLevels]
      // locations API uses singular types; UI needs to display them as plural.
      locals.decoratedLocationStructure = fullStructure
        .map((level, i) => (i === 0 ? capitalize(level) : pluralize(level)))
        .join(' → ')
      locals.createStructureLink = `/create-new/${locationId || prisonId}/structure`

      const pluralLevels = structureLevels.map((level: string) => pluralize(level))

      locals.createYouCanAddText = nonOxfordJoin(pluralLevels)
    }

    const createCellsNow = req.sessionModel.get<string>('createCellsNow')

    if (createCellsNow === 'YES') {
      const { pathHierarchy } = res.locals.decoratedResidentialSummary.location
      const newLocationCode = req.sessionModel.get<string>(`locationCode`)
      locals.locationPathPrefix = [pathHierarchy, newLocationCode].filter(s => s).join('-')
    }

    return locals
  }

  override async saveValues(req: FormWizard.Request, res: Response, next: NextFunction) {
    const { analyticsService, locationsService } = req.services

    try {
      const { sessionModel } = req
      const structureLevels = sessionModel.get<LocationType[]>('structureLevels')
      let localName = sessionModel.get<string>('localName')
      const locationCode = sessionModel.get<string>('locationCode')
      const locationType = sessionModel.get<LocationType>('locationType')
      const { prisonId } = res.locals

      if (localName === '') {
        localName = undefined
      }

      if (structureLevels?.length) {
        const fullStructure: LocationType[] = [locationType, ...structureLevels]

        const response = await locationsService.createWing(
          req.session.systemToken,
          prisonId,
          locationCode,
          fullStructure,
          localName,
        )
        req.sessionModel.set('newLocation', response)
      } else {
        const createCellsNow = sessionModel.get<string>('createCellsNow')

        const cells: Parameters<LocationsApiClient['locations']['createCells']>[2]['cells'] = []

        if (createCellsNow === 'YES') {
          const cellsToCreate = Number(sessionModel.get<string>('create-cells_cellsToCreate'))
          const bulkSanitation = sessionModel.get<string>('create-cells_bulkSanitation')
          const withoutSanitation = sessionModel.get<string[]>('create-cells_withoutSanitation')

          for (let i = 0; i < cellsToCreate; i += 1) {
            const cellAccommodationType = sessionModel.get<string>(`create-cells_set-cell-type_accommodationType${i}`)
            const cellTypes =
              sessionModel.get<string[] | string>(
                `create-cells_set-cell-type_${cellAccommodationType === 'NORMAL_ACCOMMODATION' ? 'normal' : 'specialist'}CellTypes${i}`,
              ) || []

            cells.push({
              code: sessionModel.get<string>(`create-cells_cellNumber${i}`).padStart(3, '0'),
              cellMark: sessionModel.get<string>(`create-cells_doorNumber${i}`),
              certifiedNormalAccommodation: Number(sessionModel.get<string>(`create-cells_baselineCna${i}`)),
              maxCapacity: Number(sessionModel.get<string>(`create-cells_maximumCapacity${i}`)),
              workingCapacity: Number(sessionModel.get<string>(`create-cells_workingCapacity${i}`)),
              specialistCellTypes: typeof cellTypes === 'string' ? [cellTypes] : cellTypes,
              inCellSanitation: bulkSanitation === 'YES' || !withoutSanitation.includes(i.toString()),
            })
          }
        }

        const response = await locationsService.createCells(req.session.systemToken, {
          prisonId,
          parentLocation: sessionModel.get<string>('locationId'),
          newLevelAboveCells: {
            levelCode: locationCode,
            levelLocalName: localName,
            locationType: locationType as 'LANDING' | 'SPUR',
          },
          cellsUsedFor: [],
          accommodationType: 'NORMAL_ACCOMMODATION',
          cells,
        })
        req.sessionModel.set('newLocation', response)
      }

      analyticsService.sendEvent(req, `create_${locationType}_location`, {
        prison_id: prisonId,
        code: req.sessionModel.get<Location>('newLocation').pathHierarchy,
        localName,
      })

      next()
    } catch (error) {
      next(error)
    }
  }

  override async successHandler(req: FormWizard.Request, res: Response, _next: NextFunction) {
    const { systemToken } = req.session
    const location = req.sessionModel.get<Location>('newLocation')
    const decoratedLocation = await decorateLocation({
      location,
      systemToken,
      userToken: '', // not required when limited: true
      manageUsersService: null, // not required when limited: true
      locationsService: req.services.locationsService,
      limited: true,
    })

    req.journeyModel.reset()
    req.sessionModel.reset()

    req.flash('success', {
      title: `${decoratedLocation.locationType} created`,
      content: `You have created ${decoratedLocation.locationType.toLowerCase()} ${decoratedLocation.localName || decoratedLocation.pathHierarchy}.`,
    })

    res.redirect(`/view-and-update-locations/${decoratedLocation.prisonId}/${decoratedLocation.id}`)
  }
}
