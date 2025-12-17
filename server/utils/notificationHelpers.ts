import { PaginatedUsers } from '../data/manageUsersApiClient'
import { NotificationDetails, NotificationType } from '../services/notificationService'

// Get distinct email addresses from manageUsersService, passing in caseload and roles.
export async function getUserEmails(
  manageUsersService: {
    getAllUsersByCaseload: (systemToken: string, prisonId: string, roles: string[]) => Promise<PaginatedUsers>
  },
  systemToken: string,
  prisonId: string,
  roles: string[],
): Promise<string[]> {
  const users: PaginatedUsers = await manageUsersService.getAllUsersByCaseload(systemToken, prisonId, roles)
  const emails = users.content.map(user => user.email).filter(email => email)
  return [...new Set(emails)]
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
