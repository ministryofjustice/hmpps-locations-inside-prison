import { notificationServiceFactory } from '../../services/notificationService'
import batchSendEmails from '../batchEmailRunner'

export default async function sendChangeRequestReceivedEmails(
  recipients: string[],
  submittedBy: string,
  establishment: string,
  delayMs = 10,
) {
  const notificationService = notificationServiceFactory()
  return batchSendEmails(
    recipients,
    (email, args) => notificationService.sendChangeRequestReceivedEmail(email, args.submittedBy, args.establishment),
    { submittedBy, establishment },
    delayMs,
  )
}
