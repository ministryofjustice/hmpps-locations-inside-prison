import { notificationServiceFactory } from '../../services/notificationService'
import batchSendEmails from '../batchEmailRunner'

export default async function sendRequestApprovalEmails(recipients: string[], establishment: string, delayMs = 10) {
  const notificationService = notificationServiceFactory()
  return batchSendEmails(
    recipients,
    (email, args) => notificationService.sendRequestApprovalEmail(email, args.establishment),
    { establishment },
    delayMs,
  )
}
