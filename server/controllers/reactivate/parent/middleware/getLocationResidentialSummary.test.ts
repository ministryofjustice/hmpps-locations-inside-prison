import LocationFactory from '../../../../testutils/factories/location'
import getLocationResidentialSummary from './getLocationResidentialSummary'

describe('getLocationResidentialSummary', () => {
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

  it('sets the locationResidentialSummary local', async () => {
    await getLocationResidentialSummary(req, res, next)

    expect(res.locals.locationResidentialSummary).toEqual('residentialSummary')
  })
})
