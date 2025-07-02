import { Response, Request } from 'express'
import { DeepPartial } from 'fishery'
import LocationFactory from '../testutils/factories/location'
import populateTopLevelDraftLocationSummary from './populateTopLevelDraftLocationSummary'
import LocationResidentialSummaryFactory from '../testutils/factories/locationResidentialSummary'
import { Location } from '../data/types/locationsApi'

const locations: { [id: string]: Location } = {
  topLevelActiveLocation: LocationFactory.build({
    id: 'topLevelActiveLocation',
    parentId: undefined,
    status: 'ACTIVE',
  }),
  topLevelDraftLocation: LocationFactory.build({
    id: 'topLevelDraftLocation',
    parentId: 'topLevelActiveLocation',
    status: 'DRAFT',
  }),
  draftChild1: LocationFactory.build({
    id: 'draftChild1',
    parentId: 'topLevelDraftLocation',
    status: 'DRAFT',
  }),
  draftChild2: LocationFactory.build({
    id: 'draftChild2',
    parentId: 'draftChild1',
    status: 'DRAFT',
  }),
  draftChild3: LocationFactory.build({
    id: 'draftChild3',
    parentId: 'draftChild2',
    status: 'DRAFT',
  }),
}

describe('populateTopLevelDraftLocationSummary', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      session: { systemToken: 'token' },
      services: {
        locationsService: {
          getLocation: (token, id, includeHistory) => Promise.resolve(locations[id]),
          getResidentialSummary: (token, prisonId, id) =>
            Promise.resolve(
              LocationResidentialSummaryFactory.build({
                parentLocation: locations[id],
              }),
            ),
        },
      },
    }
    deepRes = {
      locals: {
        decoratedResidentialSummary: {
          location: { raw: locations.draftChild3, ...locations.draftChild3 },
        },
      },
      redirect: jest.fn(),
    }
  })

  it('correctly drills up to the top level draft location', async () => {
    await populateTopLevelDraftLocationSummary(deepReq as Request, deepRes as Response, jest.fn())
    expect(deepRes.locals.topLevelDraftLocationSummary.parentLocation).toEqual(locations.topLevelDraftLocation)
  })
})
