import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import locationHistoryShowController from './locationHistoryShow'
import LocationFactory from '../testutils/factories/location'
import { Services } from '../services'
import AuthService from '../services/authService'
import ManageUsersService from '../services/manageUsersService'

jest.mock('../services/authService')
jest.mock('../services/manageUsersService')

describe('view locations show', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  let controller: (req: Request, res: Response) => Promise<void>
  let services: Partial<Services>
  const authService = jest.mocked(new AuthService(null))
  const manageUsersService = jest.mocked(new ManageUsersService(null))

  beforeEach(() => {
    const location = LocationFactory.build()
    deepReq = {
      session: {
        systemToken: 'token',
      },
    }
    deepRes = {
      locals: {
        location,
        user: {
          username: 'LLANLEY',
        },
      },
      render: jest.fn(),
    }
    manageUsersService.getUser = jest.fn().mockResolvedValue({ name: 'Lyle Lanley' })
    services = {
      authService,
      manageUsersService,
    }
    controller = locationHistoryShowController(services as Services)
  })

  it('renders the page', async () => {
    await controller(deepReq as Request, deepRes as Response)

    expect(deepRes.render).toHaveBeenCalledWith('pages/locationHistory/show', {
      backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      tableRows: [
        [
          { text: 'Location Type' },
          { text: 'CELL' },
          { text: 'WING' },
          { text: 'Lyle Lanley' },
          { text: '05/07/2021' },
        ],
      ],
    })
  })

  describe('when the user is not found', () => {
    beforeEach(() => {
      manageUsersService.getUser = jest.fn().mockResolvedValue(null)
    })

    it('renders the page', async () => {
      await controller(deepReq as Request, deepRes as Response)

      expect(deepRes.render).toHaveBeenCalledWith('pages/locationHistory/show', {
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        tableRows: [
          [{ text: 'Location Type' }, { text: 'CELL' }, { text: 'WING' }, { text: 'Unknown' }, { text: '05/07/2021' }],
        ],
      })
    })
  })
})
