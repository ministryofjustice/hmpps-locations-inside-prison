import { getUserEmails } from './notificationHelpers'
import ManageUsersService from '../services/manageUsersService'

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
})
