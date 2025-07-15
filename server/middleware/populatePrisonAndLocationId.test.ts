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
      locals: {},
      redirect: jest.fn(),
    }
  })

  describe('when prisonId is present', () => {
    beforeEach(() => {
      deepReq.params.prisonId = 'prisonId'
    })

    it('populates the prisonId', async () => {
      await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

      expect(deepRes.locals.prisonId).toEqual(deepRes.locals.prisonId)
      expect(deepRes.locals.locationId).toEqual(undefined)
    })

    describe('when locationId is present', () => {
      beforeEach(() => {
        deepReq.params.locationId = '7e570000-0000-1000-8000-000000000001'
      })

      it('populates the locals', async () => {
        await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

        expect(deepRes.locals.prisonId).toEqual(deepRes.locals.prisonId)
        expect(deepRes.locals.locationId).toEqual(deepRes.locals.locationId)
      })
    })
  })

  describe('when locationId is present', () => {
    beforeEach(() => {
      deepReq.params.locationId = '7e570000-0000-1000-8000-000000000001'
    })

    it('populates the locals', async () => {
      await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

      expect(deepRes.locals.prisonId).toEqual('resolvedPrisonId')
      expect(deepRes.locals.locationId).toEqual(deepRes.locals.locationId)
    })
  })

  describe('when prisonOrLocationId is present', () => {
    describe('when prisonOrLocationId is a prison id', () => {
      beforeEach(() => {
        deepReq.params.prisonOrLocationId = 'prisonId'
      })

      it('populates the prisonId', async () => {
        await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

        expect(deepRes.locals.prisonId).toEqual(deepRes.locals.prisonId)
        expect(deepRes.locals.locationId).toEqual(undefined)
      })
    })

    describe('when prisonOrLocationId is a location id (uuid)', () => {
      beforeEach(() => {
        deepReq.params.prisonOrLocationId = '7e570000-0000-1000-8000-000000000001'
      })

      it('populates the locals', async () => {
        await populatePrisonAndLocationId(deepReq as Request, deepRes as Response, jest.fn())

        expect(deepRes.locals.prisonId).toEqual(deepRes.locals.prisonId)
        expect(deepRes.locals.locationId).toEqual(deepRes.locals.locationId)
      })
    })
  })
})
