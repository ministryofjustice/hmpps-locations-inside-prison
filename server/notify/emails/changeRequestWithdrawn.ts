import { notificationServiceFactory } from '../../services/notificationService'
import { batchSendEmails } from '../batchEmailRunner'

export default async function sendChangeRequestWithdrawnEmails(
  recipients: string[],
  establishment: string,
  location: string,
  changeType: string,
  submittedOn: string,
  submittedBy: string,
  withdrawnBy: string,
  withdrawReason: string,
  delayMs = 10,
) {
  const notificationService = notificationServiceFactory()
  return batchSendEmails(
    recipients,
    (email, args) => notificationService.sendChangeRequestWithdrawnEmail(email, args),
    { establishment, location, changeType, submittedOn, submittedBy, withdrawnBy, withdrawReason },
    delayMs,
  )
}
