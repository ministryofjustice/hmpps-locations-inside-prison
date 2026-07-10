import { PaginatedUsers } from '../data/manageUsersApiClient'
import { NotificationDetails, NotificationType, notificationGroups } from '../services/notificationService'
import ManageUsersService from '../services/manageUsersService'
import config from '../config'

// Get distinct email addresses from manageUsersService, passing in caseload and roles.
export async function getUserEmails(
  manageUsersService: ManageUsersService,
  systemToken: string,
  prisonId: string,
  roles: string[],
  onlyActiveCaseload = true,
): Promise<string[]> {
  const getterFunction = onlyActiveCaseload ? 'getAllUsersByActiveCaseload' : 'getAllUsersByCaseload'
  const users: PaginatedUsers = await manageUsersService[getterFunction](systemToken, prisonId, roles)
  const emails = users.content.map(user => user.email).filter(email => email)
  return [...new Set(emails)]
}

// Get all cert user email addresses, using the functional mailbox for viewers if configured.
export async function getAllCertUserEmails(
  manageUsersService: ManageUsersService,
  systemToken: string,
  prisonId: string,
): Promise<string[]> {
  const certViewerMailbox = config.email.functionalMailboxCertViewers
  if (!certViewerMailbox) {
    return getUserEmails(manageUsersService, systemToken, prisonId, notificationGroups.allCertUsers)
  }

  const otherRoles = notificationGroups.allCertUsers.filter(
    role => !notificationGroups.requestSubmittedUsers.includes(role),
  )
  const userEmailAddresses = await getUserEmails(manageUsersService, systemToken, prisonId, otherRoles)
  return [...new Set([...userEmailAddresses, certViewerMailbox])]
}

export async function sendNotification(
  notifyService?: { notify: (details: NotificationDetails) => Promise<void> },
  emailAddresses?: string[],
  prisonName?: string,
  url?: string,
  type?: NotificationType,
  location?: string,
  changeType?: string,
  submittedOn?: string,
  submittedBy?: string,
  withdrawnBy?: string,
  withdrawReason?: string,
  rejectedBy?: string,
  rejectionReason?: string,
) {
  const details: NotificationDetails = {
    type,
    emailAddresses,
    establishment: prisonName,
    url,
    location,
    changeType,
    submittedOn,
    submittedBy,
    withdrawnBy,
    withdrawReason,
    rejectedBy,
    rejectionReason,
  }
  await notifyService.notify(details)
}
