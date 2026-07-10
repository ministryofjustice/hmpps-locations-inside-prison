import { getUserEmails, getAllCertUserEmails } from './notificationHelpers'
import ManageUsersService from '../services/manageUsersService'
import ManageUsersApiClient from '../data/manageUsersApiClient'
import config from '../config'
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

describe('getAllCertUserEmails', () => {
  const manageUsersService = new ManageUsersService(null) as jest.Mocked<ManageUsersService>
  const originalFunctionalMailboxCertViewers = config.email.functionalMailboxCertViewers

  beforeEach(() => {
    config.email.functionalMailboxCertViewers = originalFunctionalMailboxCertViewers
    manageUsersService.getAllUsersByActiveCaseload = jest
      .fn()
      .mockImplementation((_token: string, _prisonId: string, roles: string[]) =>
        Promise.resolve({
          content:
            roles.length === 3
              ? [
                  { username: 'reviewer', email: 'reviewer@test.com' },
                  { username: 'admin', email: 'admin@test.com' },
                  { username: 'viewer', email: 'viewer@test.com' },
                ]
              : [
                  { username: 'reviewer', email: 'reviewer@test.com' },
                  { username: 'admin', email: 'admin@test.com' },
                ],
          totalPages: 1,
        }),
      )
  })

  it('combines non-viewer role emails and viewer role emails', async () => {
    const result = await getAllCertUserEmails(manageUsersService, 'token', 'TST')

    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledWith(
      'token',
      'TST',
      notificationGroups.allCertUsers,
    )
    expect(result).toEqual(['reviewer@test.com', 'admin@test.com', 'viewer@test.com'])
  })

  it('uses the functional mailbox instead of fetching viewer role emails when configured', async () => {
    config.email.functionalMailboxCertViewers = 'functional-mailbox@test.com'

    const result = await getAllCertUserEmails(manageUsersService, 'token', 'TST')

    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledTimes(1)
    expect(manageUsersService.getAllUsersByActiveCaseload).toHaveBeenCalledWith('token', 'TST', [
      'MANAGE_RES_LOCATIONS_OP_CAP',
      'RESI__CERT_REVIEWER',
    ])
    expect(result).toEqual(['reviewer@test.com', 'admin@test.com', 'functional-mailbox@test.com'])
  })
})
