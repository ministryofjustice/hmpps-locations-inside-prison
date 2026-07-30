import { Response, Request } from 'express'
import { DeepPartial } from 'fishery'
import populatePrisonAndLocationId from './populatePrisonAndLocationId'

describe('populatePrisonAndLocationId', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      params: {},
      session: { systemToken: 'token' },
      services: {
        locationsService: {
          getLocation: (_token, _id, _includeHistory) => Promise.resolve({ prisonId: 'resolvedPrisonId' } as any),
        },
      },
    }
    deepRes = {
      locals: {
        user: {
          activeCaseload: {
            id: 'ACT',
          },
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('when prisonId is present', () => {
    beforeEach(() => {
      deepReq.params.prisonId = 'prisonId'
    })

    it('populates the prisonId', async () => {
      await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

      expect(deepRes.locals.prisonId).toEqual(deepReq.params.prisonId)
      expect(deepRes.locals.locationId).toEqual(undefined)
    })

    describe('when locationId is present', () => {
      beforeEach(() => {
        deepReq.params.locationId = '7e570000-0000-1000-8000-000000000001'
      })

      it('populates the locals', async () => {
        await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

        expect(deepRes.locals.prisonId).toEqual(deepReq.params.prisonId)
        expect(deepRes.locals.locationId).toEqual(deepReq.params.locationId)
      })
    })
  })

  describe('when prisonId is missing', () => {
    it('populates the prisonId from the active caseload', async () => {
      await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

      expect(deepRes.locals.prisonId).toEqual('ACT')
      expect(deepRes.locals.locationId).toEqual(undefined)
    })
  })
})
