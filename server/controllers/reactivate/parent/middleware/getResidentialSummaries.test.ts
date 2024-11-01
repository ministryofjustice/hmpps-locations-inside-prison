import LocationFactory from '../../../../testutils/factories/location'
import getResidentialSummaries from './getResidentialSummaries'

describe('getResidentialSummaries', () => {
  let req: any
  let res: any
  let next: any

  const location = LocationFactory.build({
    id: 'l1',
    parentId: 'p1',
  })

  beforeEach(() => {
    next = jest.fn()
    req = {
      session: {},
      services: {
        authService: {
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService: {
          getResidentialSummary: jest.fn().mockResolvedValue('residentialSummary'),
        },
      },
    }
    res = {
      locals: {
        location,
        user: {
          username: 'username',
        },
      },
    }
  })

  it('sets the summary locals', async () => {
    await getResidentialSummaries(req, res, next)

    expect(res.locals.locationResidentialSummary).toEqual('residentialSummary')
    expect(res.locals.prisonResidentialSummary).toEqual('residentialSummary')
  })
})
