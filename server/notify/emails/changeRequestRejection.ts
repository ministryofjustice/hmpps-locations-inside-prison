import { notificationServiceFactory } from '../../services/notificationService'
import { batchSendEmails } from '../batchEmailRunner'

export default async function sendChangeRequestRejectionEmails(
  recipients: string[],
  establishment: string,
  location: string,
  changeType: string,
  submittedOn: string,
  submittedBy: string,
  rejectionBy: string,
  rejectionReason: string,
  delayMs = 10,
) {
  const notificationService = notificationServiceFactory()
  return batchSendEmails(
    recipients,
    (email, args) => notificationService.sendChangeRequestRejectionEmail(email, args),
    { establishment, location, changeType, submittedOn, submittedBy, rejectionBy, rejectionReason },
    delayMs,
  )
}
