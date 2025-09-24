import logger from '../../logger'
import { EmailResponse } from '../services/notificationService'

// eslint-disable-next-line import/prefer-default-export
export async function batchSendEmails<T extends { establishment: string }>(
  recipients: string[],
  sendEmail: (recipient: string, args: T) => Promise<EmailResponse>,
  args: T,
  delayMs = 10,
) {
  let emailsSent = 0
  logger.info(`Starting batch send of ${recipients.length} emails`)

  for (const email of recipients) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await sendEmail(email, args)
      emailsSent += 1
    } catch (error) {
      logger.error(`Error sending email: ${error}`)
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => {
      setTimeout(resolve, delayMs)
    })
  }
  logger.info(
    `Finished batch send of emails for ${args.establishment}. Successfully sent ${emailsSent} of ${recipients.length} emails`,
  )
}
