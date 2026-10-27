import { Request, Response } from 'express'
import { DeepPartial } from 'fishery'
import populateInactiveCells from './populateInactiveCells'
import LocationFactory from '../testutils/factories/location'
import { Services } from '../services'
import LocationsService from '../services/locationsService'
import ManageUsersService from '../services/manageUsersService'

jest.mock('../services/locationsService')
jest.mock('../services/manageUsersService')

describe('populateInactiveCells', () => {
  let deepReq: DeepPartial<Request>
  let deepRes: DeepPartial<Response>
  const next = jest.fn()
  const locationsService = jest.mocked(new LocationsService(null))
  const manageUsersService = jest.mocked(new ManageUsersService(null))
  const services = { locationsService, manageUsersService } as unknown as Services

  beforeEach(() => {
    jest.resetAllMocks()
    deepReq = {
      session: { systemToken: 'system-token' },
      services,
    }
    deepRes = {
      locals: { user: { token: 'user-token' }, prisonId: 'TST' },
    }
    locationsService.getInactiveCells.mockResolvedValue([
      LocationFactory.build({ deactivatedBy: 'USER_A', lastModifiedBy: 'USER_B', deactivatedReason: 'DAMAGED' }),
      LocationFactory.build({ deactivatedBy: 'USER_A', lastModifiedBy: 'USER_C', deactivatedReason: 'DAMAGED' }),
      LocationFactory.build({ deactivatedBy: 'USER_D', lastModifiedBy: 'USER_B', deactivatedReason: 'DAMAGED' }),
    ])
    locationsService.getLocationType.mockResolvedValue('Cell')
    locationsService.getDeactivatedReason.mockResolvedValue('Damage')
    locationsService.getAccommodationType.mockResolvedValue('Normal accommodation')
    locationsService.getSpecialistCellType.mockResolvedValue('Specialist')
    locationsService.getUsedForType.mockResolvedValue('Used for')
    manageUsersService.getUser.mockImplementation((_token, username) =>
      Promise.resolve(username === 'USER_D' ? null : { username, name: `Name of ${username}` }),
    )
  })

  it('looks up each user who deactivated a cell once', async () => {
    await populateInactiveCells(services)(deepReq as Request, deepRes as Response, next)

    expect(manageUsersService.getUser).toHaveBeenCalledTimes(2)
    expect(manageUsersService.getUser).toHaveBeenCalledWith('user-token', 'USER_A')
    expect(manageUsersService.getUser).toHaveBeenCalledWith('user-token', 'USER_D')
    expect(next).toHaveBeenCalledWith()
  })

  it('shows the name of the user who deactivated each cell, or their username if not found', async () => {
    await populateInactiveCells(services)(deepReq as Request, deepRes as Response, next)

    expect(deepRes.locals.inactiveCells.map((c: { deactivatedBy: string }) => c.deactivatedBy)).toEqual([
      'Name of USER_A',
      'Name of USER_A',
      'USER_D',
    ])
    expect(deepRes.locals.inactiveCells[0].deactivatedReason).toEqual('Damage')
  })
})
