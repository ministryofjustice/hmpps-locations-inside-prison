import { getUserEmails, getNotificationGroupEmails, getAllCertUserEmails } from './notificationHelpers'
import ManageUsersService from '../services/manageUsersService'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import LocationsService from '../services/locationsService'
import { notificationGroups } from '../services/notificationService'

describe('getUserEmails', () => {
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  manageUsersService.getAllUsersByActiveCaseload = jest.fn().mockResolvedValue({
    content: [
      { username: 'joe1', email: 'joe1@test.com' },
      { username: 'joe2', email: 'joe2@test.com' },
      { username: 'joey_no_email', email: null },
    ],
    totalPages: 2,
  })
  manageUsersService.getAllUsersByCaseload = jest.fn().mockResolvedValue({
    content: [
      { username: 'joe3', email: 'joe3@test.com' },
      { username: 'joe4', email: 'joe4@test.com' },
      { username: 'joey_no_email', email: null },
    ],
    totalPages: 2,
  })

  it('returns the correct list of users with active caseload', async () => {
    const result = await getUserEmails(manageUsersService, 'token', 'TST', ['RESI__CERT_REVIEWER'])
    expect(result).toEqual(['joe1@test.com', 'joe2@test.com'])
  })

  it('returns the correct list of users with caseload', async () => {
    const result = await getUserEmails(manageUsersService, 'token', 'TST', ['RESI__CERT_REVIEWER'], false)
    expect(result).toEqual(['joe3@test.com', 'joe4@test.com'])
  })

  // Regression test for MAPA-126: getUserEmails used to pick the getter as a detached method
  // reference, which lost its `this` binding and threw when the real service method tried to
  // access `this.manageUsersApiClient`. Backing the service with a mocked apiClient runs the
  // real (this-dependent) method body, so it fails under the old code and passes after the fix.
  describe('with real service methods backed by a mocked apiClient', () => {
    const getUsersByActiveCaseload = jest.fn().mockResolvedValue({
      content: [{ username: 'joe1', email: 'joe1@test.com' }],
      totalPages: 1,
    })
    const getUsersByCaseload = jest.fn().mockResolvedValue({
      content: [{ username: 'joe3', email: 'joe3@test.com' }],
      totalPages: 1,
    })
    const manageUsersApiClient = {
      users: { getUsersByActiveCaseload, getUsersByCaseload },
    } as unknown as ManageUsersApiClient
    const service = new ManageUsersService(manageUsersApiClient)

    it('keeps the `this` binding when calling the active caseload getter', async () => {
      const result = await getUserEmails(service, 'token', 'TST', ['RESI__CERT_REVIEWER'])
      expect(result).toEqual(['joe1@test.com'])
      expect(getUsersByActiveCaseload).toHaveBeenCalled()
    })

    it('keeps the `this` binding when calling the caseload getter', async () => {
      const result = await getUserEmails(service, 'token', 'TST', ['RESI__CERT_REVIEWER'], false)
      expect(result).toEqual(['joe3@test.com'])
      expect(getUsersByCaseload).toHaveBeenCalled()
    })
  })
})

describe('getNotificationGroupEmails', () => {
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    manageUsersService.getAllUsersByActiveCaseload = jest.fn().mockResolvedValue({
      content: [{ username: 'joe1', email: 'joe1@test.com' }],
      totalPages: 1,
    })
  })

  it('uses the API notification mailbox when one is configured', async () => {
    locationsService.getNotificationMailboxEmails = jest.fn().mockResolvedValue(['mailbox@test.com'])

    const result = await getNotificationGroupEmails(
      locationsService,
      manageUsersService,
      'token',
      'TST',
      'CERT_REVIEWER',
      notificationGroups.requestReceivedUsers,
    )

    expect(locationsService.getNotificationMailboxEmails).toHaveBeenCalledWith('token', 'TST', 'CERT_REVIEWER')
    expect(manageUsersService.getAllUsersByActiveCaseload).not.toHaveBeenCalled()
    expect(result).toEqual(['mailbox@test.com'])
  })

  it('falls back to user emails by role when no mailbox is configured', async () => {
    locationsService.getNotificationMailboxEmails = jest.fn().mockResolvedValue(undefined)

    const result = await getNotificationGroupEmails(
      locationsService,
      manageUsersService,
      'token',
      'TST',
      'CERT_REVIEWER',
      notificationGroups.requestReceivedUsers,
    )

    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledWith(
      'token',
      'TST',
      notificationGroups.requestReceivedUsers,
    )
    expect(result).toEqual(['joe1@test.com'])
  })
})

describe('getAllCertUserEmails', () => {
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    locationsService.getNotificationMailboxEmails = jest.fn().mockResolvedValue(undefined)
    manageUsersService.getAllUsersByActiveCaseload = jest
      .fn()
      .mockImplementation((_token: string, _prisonId: string, roles: string[]) => {
        let content
        if (roles === notificationGroups.requestReceivedUsers) {
          content = [{ username: 'reviewer', email: 'reviewer@test.com' }]
        } else if (roles === notificationGroups.requestSubmittedUsersWithActiveCaseload) {
          content = [{ username: 'admin', email: 'admin@test.com' }]
        } else {
          content = [{ username: 'viewer', email: 'viewer@test.com' }]
        }
        return Promise.resolve({ content, totalPages: 1 })
      })
  })

  it('combines emails for all cert notification groups', async () => {
    const result = await getAllCertUserEmails(locationsService, manageUsersService, 'token', 'TST')

    expect(locationsService.getNotificationMailboxEmails).toHaveBeenCalledWith('token', 'TST', 'CERT_REVIEWER')
    expect(locationsService.getNotificationMailboxEmails).toHaveBeenCalledWith('token', 'TST', 'CERT_VIEWER')
    expect(locationsService.getNotificationMailboxEmails).toHaveBeenCalledWith('token', 'TST', 'CERT_ADMIN')
    expect(result).toEqual(['reviewer@test.com', 'viewer@test.com', 'admin@test.com'])
  })

  it('uses the functional mailbox for a notification group when the API returns one', async () => {
    ;(locationsService.getNotificationMailboxEmails as jest.Mock).mockImplementation(
      (_token: string, _prisonId: string, notificationGroup: string) =>
        Promise.resolve(notificationGroup === 'CERT_VIEWER' ? ['mailbox@test.com'] : undefined),
    )

    const result = await getAllCertUserEmails(locationsService, manageUsersService, 'token', 'TST')

    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledWith(
      'token',
      'TST',
      notificationGroups.requestReceivedUsers,
    )
    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledWith(
      'token',
      'TST',
      notificationGroups.requestSubmittedUsersWithActiveCaseload,
    )
    expect(result).toEqual(['reviewer@test.com', 'mailbox@test.com', 'admin@test.com'])
  })
})
