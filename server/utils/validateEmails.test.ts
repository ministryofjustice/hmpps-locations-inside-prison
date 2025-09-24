import { validateEmails } from './validateEmails'
import { UserAccount } from '../data/manageUsersApiClient'

describe('getValidEmailAddresses', () => {
  it('should return only valid email addresses', () => {
    const users: UserAccount[] = [
      { email: 'joebloggs@example.com' } as UserAccount,
      { email: null } as UserAccount,
      { email: undefined } as UserAccount,
      { email: '' } as UserAccount,
      { email: 'joebloggs2@example.com' } as UserAccount,
    ]

    const result = validateEmails(users)

    expect(result).toEqual(['joebloggs@example.com', 'joebloggs2@example.com'])
  })

  it('should return an empty array if no valid emails are present', () => {
    const users: UserAccount[] = [
      { email: null } as UserAccount,
      { email: undefined } as UserAccount,
      { email: '' } as UserAccount,
    ]

    const result = validateEmails(users)

    expect(result).toEqual([])
  })
})
