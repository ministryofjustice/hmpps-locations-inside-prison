import ManageUsersApiClient from '../data/manageUsersApiClient'
import ManageUsersService from './manageUsersService'

jest.mock('../data/manageUsersApiClient')

describe('Manage users service', () => {
  let apiClient: jest.Mocked<ManageUsersApiClient>
  let service: ManageUsersService

  beforeEach(() => {
    apiClient = new ManageUsersApiClient(null, null) as jest.Mocked<ManageUsersApiClient>
    apiClient.users = {
      me: {
        get: jest.fn() as jest.Mocked<any>,
        getCaseloads: jest.fn() as jest.Mocked<any>,
      },
      get: jest.fn() as jest.Mocked<any>,
      getUsersByCaseload: jest.fn() as jest.Mocked<any>,
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

  describe('getAllUsersByCaseload', () => {
    it('calls the correct client function, gets all pages and concatenates users', async () => {
      apiClient.users.getUsersByCaseload
        // @ts-expect-error @ts-ignore
        .mockResolvedValueOnce({
          content: [{ username: 'joe1', email: 'joe1@test.com' }],
          totalPages: 2,
        })
        .mockResolvedValueOnce({
          content: [{ username: 'joe2', email: 'joe2@test.com' }],
          totalPages: 2,
        })

      const result = await service.getAllUsersByCaseload('token', 'CASELOAD', 'ROLE')

      expect(apiClient.users.getUsersByCaseload).toHaveBeenNthCalledWith(1, 'token', {
        caseload: 'CASELOAD',
        accessRoles: 'ROLE',
        page: '0',
        size: '50',
      })
      expect(apiClient.users.getUsersByCaseload).toHaveBeenNthCalledWith(2, 'token', {
        caseload: 'CASELOAD',
        accessRoles: 'ROLE',
        page: '1',
        size: '50',
      })

      expect(result).toEqual({
        content: [
          { username: 'joe1', email: 'joe1@test.com' },
          { username: 'joe2', email: 'joe2@test.com' },
        ],
        totalPages: 2,
      })
    })
  })
})
