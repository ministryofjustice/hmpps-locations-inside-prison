import { DeepPartial } from 'fishery'
import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import LocationFactory from '../../../../testutils/factories/location'
import populateLocationTree from './populateLocationTree'
import LocationResidentialSummaryFactory from '../../../../testutils/factories/locationResidentialSummary'
import { Location } from '../../../../data/types/locationsApi'
import decorateLocation from '../../../../decorators/location'
import LocationsService from '../../../../services/locationsService'

const populateLocationsFunc = populateLocationTree(false)

describe('populateLocations', () => {
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: any

  let sessionModelValues: { [k: string]: any }

  const location = LocationFactory.build({
    id: 'location',
    parentId: undefined,
    locationType: 'WING',
  })
  const location1 = LocationFactory.build({
    id: 'location1',
    parentId: 'location',
    locationType: 'LANDING',
  })
  const location1a = LocationFactory.build({
    id: 'location1a',
    parentId: 'location1',
    locationType: 'SPUR',
  })
  const location1b = LocationFactory.build({
    id: 'location1b',
    parentId: 'location1',
    locationType: 'SPUR',
  })
  const location1b1 = LocationFactory.build({
    id: 'location1b1',
    parentId: 'location1b',
    locationType: 'CELL',
  })
  const location2 = LocationFactory.build({
    id: 'location2',
    parentId: 'location',
    locationType: 'LANDING',
  })
  const location2a = LocationFactory.build({
    id: 'location2a',
    parentId: 'location2',
    locationType: 'CELL',
  })
  const location2b = LocationFactory.build({
    id: 'location2b',
    parentId: 'location2',
    locationType: 'CELL',
  })
  const location3 = LocationFactory.build({
    id: 'location3',
    parentId: 'location',
    locationType: 'LANDING',
  })
  const location3a = LocationFactory.build({
    id: 'location3a',
    parentId: 'location3',
    locationType: 'CELL',
  })
  const location3b = LocationFactory.build({
    id: 'location3b',
    parentId: 'location3',
    locationType: 'CELL',
  })
  const location3c = LocationFactory.build({
    id: 'location3c',
    parentId: 'location3',
    locationType: 'CELL',
  })
  const location3d = LocationFactory.build({
    id: 'location3d',
    parentId: 'location3',
    locationType: 'CELL',
  })
  const residentialSummaries: {
    [prisonId: string]: { [locationId: string]: ReturnType<typeof LocationResidentialSummaryFactory.build> }
  } = {
    TST: {
      location: LocationResidentialSummaryFactory.build({
        parentLocation: location,
        subLocations: [location1, location2, location3],
      }),
      location1: LocationResidentialSummaryFactory.build({
        parentLocation: location1,
        subLocations: [location1a, location1b],
      }),
      location1a: LocationResidentialSummaryFactory.build({
        parentLocation: location1a,
        subLocations: [],
      }),
      location1b: LocationResidentialSummaryFactory.build({
        parentLocation: location1b,
        subLocations: [location1b1],
      }),
      location1b1: LocationResidentialSummaryFactory.build({
        parentLocation: location1b1,
        subLocations: [],
      }),
      location2: LocationResidentialSummaryFactory.build({
        parentLocation: location2,
        subLocations: [location2a, location2b],
      }),
      location2a: LocationResidentialSummaryFactory.build({
        parentLocation: location2a,
        subLocations: [],
      }),
      location2b: LocationResidentialSummaryFactory.build({
        parentLocation: location2b,
        subLocations: [],
      }),
      location3: LocationResidentialSummaryFactory.build({
        parentLocation: location3,
        subLocations: [location3a, location3b, location3c, location3d],
      }),
      location3a: LocationResidentialSummaryFactory.build({
        parentLocation: location3a,
        subLocations: [],
      }),
      location3b: LocationResidentialSummaryFactory.build({
        parentLocation: location3b,
        subLocations: [],
      }),
      location3c: LocationResidentialSummaryFactory.build({
        parentLocation: location3c,
        subLocations: [],
      }),
      location3d: LocationResidentialSummaryFactory.build({
        parentLocation: location3d,
        subLocations: [],
      }),
    },
  }

  const decorate = async (l: Location) => {
    return decorateLocation({
      location: l,
      systemToken: 'token',
      userToken: '', // not required when limited: true
      manageUsersService: null, // not required when limited: true
      locationsService: deepReq.services.locationsService as LocationsService,
      limited: true,
    })
  }

  beforeEach(() => {
    sessionModelValues = {}
    next = jest.fn()
    deepReq = {
      session: { systemToken: 'token' },
      sessionModel: {
        get: (key: string) => sessionModelValues[key],
      },
      services: {
        locationsService: {
          getResidentialSummary: (_token: string, prisonId: string, id: string) =>
            Promise.resolve(residentialSummaries[prisonId][id]),
          getAccommodationType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
          getConvertedCellType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
          getDeactivatedReason: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
          getLocationType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
          getSpecialistCellType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
          getUsedForType: (_token: string, type: string) => Promise.resolve(`Resolved ${type}`),
        },
      },
    }
    deepRes = {
      locals: {
        location,
        locationResidentialSummary: residentialSummaries.TST.location,
        user: {
          username: 'username',
        },
      },
    }
  })

  describe('when selectLocations is populated', () => {
    beforeEach(() => {
      sessionModelValues.selectLocations = ['location1']
    })

    it('populates the locations', async () => {
      await populateLocationsFunc(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.cells).toEqual([location1b1])
      expect(deepRes.locals.locationTree).toEqual([
        {
          location: location1,
          subLocations: [
            { location: location1a, subLocations: [] },
            { location: location1b, subLocations: [{ location: location1b1, subLocations: [] }] },
          ],
        },
      ])
    })

    describe('when decorate: true', () => {
      const populateLocationsDecorateFunc = populateLocationTree(true)

      it('populates the locations with DecoratedLocations', async () => {
        await populateLocationsDecorateFunc(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(deepRes.locals.decoratedCells).toEqual([await decorate(location1b1)])
        expect(deepRes.locals.decoratedLocationTree).toEqual([
          {
            decoratedLocation: await decorate(location1),
            decoratedSubLocations: [
              { decoratedLocation: await decorate(location1a), decoratedSubLocations: [] },
              {
                decoratedLocation: await decorate(location1b),
                decoratedSubLocations: [{ decoratedLocation: await decorate(location1b1), decoratedSubLocations: [] }],
              },
            ],
          },
        ])
      })
    })
  })

  describe('when selectLocations is not populated', () => {
    it('populates the locations', async () => {
      await populateLocationsFunc(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(deepRes.locals.cells.sort((a: Location, b: Location) => a.id.localeCompare(b.id))).toEqual([
        location1b1,
        location2a,
        location2b,
        location3a,
        location3b,
        location3c,
        location3d,
      ])
      expect(deepRes.locals.locationTree).toEqual([
        {
          location: location1,
          subLocations: [
            { location: location1a, subLocations: [] },
            { location: location1b, subLocations: [{ location: location1b1, subLocations: [] }] },
          ],
        },
        {
          location: location2,
          subLocations: [
            { location: location2a, subLocations: [] },
            { location: location2b, subLocations: [] },
          ],
        },
        {
          location: location3,
          subLocations: [
            { location: location3a, subLocations: [] },
            { location: location3b, subLocations: [] },
            { location: location3c, subLocations: [] },
            { location: location3d, subLocations: [] },
          ],
        },
      ])
    })
  })
})
