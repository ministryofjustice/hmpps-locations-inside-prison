import getReferrerRootUrl from './getReferrerRootUrl'
import LocationFactory from '../../../../testutils/factories/location'

describe('getReferrerRootUrl', () => {
  let req: any
  let res: any
  let next: any

  let sessionModelValues: { [k: string]: any }

  beforeEach(() => {
    sessionModelValues = {}
    next = jest.fn()
    req = {
      session: {},
      sessionModel: { get: (k: string) => sessionModelValues[k] },
    }
    res = {
      locals: {
        location: LocationFactory.build(),
      },
    }
  })

  describe('when there is no referrer', () => {
    it('sets the correct referrerRootUrl', async () => {
      await getReferrerRootUrl(req, res, next)

      expect(res.locals.referrerRootUrl).toEqual(`/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001`)
    })
  })

  describe('when referrerFlow is "parent"', () => {
    beforeEach(() => {
      sessionModelValues.referrerFlow = 'parent'
    })

    describe('when referrerLocationId is not provided', () => {
      it('falls back to the default referrer', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(
          `/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001`,
        )
      })
    })

    describe('when referrerLocationId is not a UUID', () => {
      beforeEach(() => {
        sessionModelValues.referrerLocationId = 'an-id'
      })

      it('falls back to the default referrer', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(
          `/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001`,
        )
      })
    })

    describe('when referrerLocationId is a valid UUID', () => {
      beforeEach(() => {
        sessionModelValues.referrerLocationId = '7e570000-0000-1000-8000-000000000002'
      })

      it('sets the correct referrerRootUrl', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(`/reactivate/parent/7e570000-0000-1000-8000-000000000002?select=1`)
      })
    })
  })

  describe('when referrerFlow is "inactive-cells"', () => {
    beforeEach(() => {
      sessionModelValues.referrerFlow = 'inactive-cells'
      sessionModelValues.referrerPrisonId = 'TST2'
    })

    describe('when referrerLocationId is not provided', () => {
      it('sets the correct getReferrerRootUrl', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(`/inactive-cells/TST2`)
      })
    })

    describe('when referrerLocationId is not a UUID', () => {
      beforeEach(() => {
        sessionModelValues.referrerLocationId = 'an-id'
      })

      it('sets the correct getReferrerRootUrl', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(`/inactive-cells/TST2`)
      })
    })

    describe('when referrerLocationId is a valid UUID', () => {
      beforeEach(() => {
        sessionModelValues.referrerLocationId = '7e570000-0000-1000-8000-000000000002'
      })

      it('sets the correct getReferrerRootUrl', async () => {
        await getReferrerRootUrl(req, res, next)

        expect(res.locals.referrerRootUrl).toEqual(`/inactive-cells/TST2/7e570000-0000-1000-8000-000000000002`)
      })
    })
  })
})
