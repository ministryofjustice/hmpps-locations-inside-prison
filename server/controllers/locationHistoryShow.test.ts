import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import locationHistoryShowController from './locationHistoryShow'
import LocationFactory from '../testutils/factories/location'
import { Services } from '../services'
import AuthService from '../services/authService'
import ManageUsersService from '../services/manageUsersService'
import paths from '../utils/paths'

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
      backLink: paths.location.view('TST', '7e570000-0000-0000-0000-000000000001'),
      minLayout: 'three-quarters',
      tableRows: [
        [
          { text: 'Location Type' },
          { text: 'CELL' },
          { text: 'WING' },
          { text: 'Lyle Lanley' },
          { text: '05/07/2021' },
        ],
      ],
      title: 'Location history',
    })
  })

  describe('when the history includes a status change', () => {
    beforeEach(() => {
      deepRes.locals.location = LocationFactory.build({
        changeHistory: [
          {
            attribute: 'Status',
            oldValues: ['Active'],
            newValues: ['Inactive'],
            amendedBy: 'user',
            amendedDate: '2021-07-05T10:35:17',
          },
        ],
      })
    })

    it('renders the old and new status as tags', async () => {
      await controller(deepReq as Request, deepRes as Response)

      const [[, { tableRows }]] = (deepRes.render as jest.Mock).mock.calls
      const [[, oldStatus, newStatus]] = tableRows
      expect(oldStatus.html).toContain('data-qa="status-tag"')
      expect(oldStatus.html).toContain('Active')
      expect(newStatus.html).toContain('govuk-tag--grey')
      expect(newStatus.html).toContain('Inactive')
    })
  })

  describe('when the user is not found', () => {
    beforeEach(() => {
      manageUsersService.getUser = jest.fn().mockResolvedValue(null)
    })

    it('renders the page', async () => {
      await controller(deepReq as Request, deepRes as Response)

      expect(deepRes.render).toHaveBeenCalledWith('pages/locationHistory/show', {
        backLink: paths.location.view('TST', '7e570000-0000-0000-0000-000000000001'),
        minLayout: 'three-quarters',
        tableRows: [
          [{ text: 'Location Type' }, { text: 'CELL' }, { text: 'WING' }, { text: 'Unknown' }, { text: '05/07/2021' }],
        ],
        title: 'Location history',
      })
    })
  })

  describe('when the same user made several changes', () => {
    beforeEach(() => {
      const change = { oldValues: ['A'], newValues: ['B'], amendedBy: 'user', amendedDate: '2021-07-05T10:35:17' }
      deepRes.locals.location = LocationFactory.build({
        changeHistory: [
          { ...change, attribute: 'Local name' },
          { ...change, attribute: 'Used for' },
          { ...change, attribute: 'Comments' },
        ],
      })
    })

    it('looks the user up once', async () => {
      await controller(deepReq as Request, deepRes as Response)

      expect(manageUsersService.getUser).toHaveBeenCalledTimes(1)
      const [[, { tableRows }]] = (deepRes.render as jest.Mock).mock.calls
      expect(tableRows.map((row: { text: string }[]) => row[3].text)).toEqual([
        'Lyle Lanley',
        'Lyle Lanley',
        'Lyle Lanley',
      ])
    })
  })
})
