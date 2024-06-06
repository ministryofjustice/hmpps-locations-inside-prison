import ManageUsersApiClient from '../data/manageUsersApiClient'
import ManageUsersService from './manageUsersService'

jest.mock('../data/manageUsersApiClient')

describe('Manage users service', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: ManageUsersService

  beforeEach(() => {
    apiClient = new ManageUsersApiClient(null) as jest.Mocked<ManageUsersApiClient>
    apiClient.users = {
      me: {
        get: jest.fn(),
        getCaseloads: jest.fn(),
      },
      get: jest.fn(),
    }
    service = new ManageUsersService(apiClient)
  })

  describe('getUser', () => {
    describe('when a username is specified', () => {
      it('calls the correct client function', async () => {
        await service.getUser('token', 'USERNAME')

        expect(apiClient.users.get).toHaveBeenCalledWith('token', { username: 'USERNAME' })
      })
    })

    describe('when a username is not specified', () => {
      it('calls the correct client function', async () => {
        await service.getUser('token')

        expect(apiClient.users.me.get).toHaveBeenCalledWith('token')
      })
    })
  })

  describe('getUserCaseloads', () => {
    describe('when a username is specified', () => {
      it('calls the correct client function', async () => {
        await service.getUser('token', 'USERNAME')

        expect(apiClient.users.get).toHaveBeenCalledWith('token', { username: 'USERNAME' })
      })
    })

    it('calls the correct client function', async () => {
      await service.getUserCaseloads('token')

      expect(apiClient.users.me.getCaseloads).toHaveBeenCalledWith('token')
    })
  })
})
