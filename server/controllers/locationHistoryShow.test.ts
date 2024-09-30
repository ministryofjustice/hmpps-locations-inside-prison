import { Request, Response } from 'express'
import locationHistoryShowController from './locationHistoryShow'
import LocationFactory from '../testutils/factories/location'
import { Services } from '../services'
import AuthService from '../services/authService'
import ManageUsersService from '../services/manageUsersService'

jest.mock('../services/authService')
jest.mock('../services/manageUsersService')

describe('view locations show', () => {
  let req: Request
  let res: Response
  let controller: (req: Request, res: Response) => Promise<void>
  let services: Services
  const authService = jest.mocked(new AuthService(null))
  const manageUsersService = jest.mocked(new ManageUsersService(null))

  beforeEach(() => {
    const location = LocationFactory.build()
    req = {} as Request
    res = {
      // @ts-ignore
      locals: {
        location,
        // @ts-ignore
        user: {
          username: 'LLANLEY',
        },
      },
      render: jest.fn(),
    }
    manageUsersService.getUser = jest.fn().mockResolvedValue({ name: 'Lyle Lanley' })
    // @ts-ignore
    services = {
      authService,
      manageUsersService,
    }
    controller = locationHistoryShowController(services)
  })

  it('renders the page', async () => {
    await controller(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/locationHistory/show', {
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
})
