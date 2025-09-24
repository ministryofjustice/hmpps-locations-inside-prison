import { UserAccount } from '../data/manageUsersApiClient'

// Util filters out any invalid emails from user accounts to ensure notify only receives valid email strings.
export function validateEmails(users: UserAccount[]): string[] {
  return users
    .map(user => user.email)
    .filter((email): email is string => Boolean(email))
}
