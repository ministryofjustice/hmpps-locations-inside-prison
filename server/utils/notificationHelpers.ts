import { PaginatedUsers } from '../data/manageUsersApiClient'
import { NotificationDetails, NotificationType, notificationGroups } from '../services/notificationService'
import ManageUsersService from '../services/manageUsersService'
import LocationsService from '../services/locationsService'
import { NotificationGroup } from '../data/types/locationsApi'

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

// Get email addresses for a notification group, preferring the prison's functional mailbox (prison-specific
// or default, resolved by the API) where one is configured, falling back to users by role otherwise.
export async function getNotificationGroupEmails(
  locationsService: LocationsService,
  manageUsersService: ManageUsersService,
  systemToken: string,
  prisonId: string,
  notificationGroup: NotificationGroup,
  roles: string[],
  onlyActiveCaseload = true,
): Promise<string[]> {
  const mailboxEmails = await locationsService.getNotificationMailboxEmails(systemToken, prisonId, notificationGroup)
  if (mailboxEmails) {
    return mailboxEmails
  }

  return getUserEmails(manageUsersService, systemToken, prisonId, roles, onlyActiveCaseload)
}

// Get all cert user email addresses, using each notification group's functional mailbox where configured.
export async function getAllCertUserEmails(
  locationsService: LocationsService,
  manageUsersService: ManageUsersService,
  systemToken: string,
  prisonId: string,
): Promise<string[]> {
  const [reviewerEmails, viewerEmails, adminEmails] = await Promise.all([
    getNotificationGroupEmails(
      locationsService,
      manageUsersService,
      systemToken,
      prisonId,
      'CERT_REVIEWER',
      notificationGroups.requestReceivedUsers,
    ),
    getNotificationGroupEmails(
      locationsService,
      manageUsersService,
      systemToken,
      prisonId,
      'CERT_VIEWER',
      notificationGroups.requestSubmittedUsers,
    ),
    getNotificationGroupEmails(
      locationsService,
      manageUsersService,
      systemToken,
      prisonId,
      'CERT_ADMIN',
      notificationGroups.requestSubmittedUsersWithActiveCaseload,
    ),
  ])
  return [...new Set([...reviewerEmails, ...viewerEmails, ...adminEmails])]
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
