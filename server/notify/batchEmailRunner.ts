import logger from '../../logger'
import { EmailResponse } from '../services/notificationService'

export async function batchSendEmails<T extends { establishment: string }>(
  recipients: string[],
  sendEmail: (recipient: string, args: T) => Promise<EmailResponse>,
  args: T,
  delayMs = 10,
) {
  let emailsSent = 0
  logger.info(`Starting batch send of ${recipients.length} emails`)

  for (const email of recipients) {
    await sendEmailWithDelay(email, sendEmail, args, delayMs)
    emailsSent += 1
  }

  logger.info(
    `Finished batch send of emails for ${args.establishment}. Successfully sent ${emailsSent} of ${recipients.length} emails`,
  )
}

async function sendEmailWithDelay<T extends { establishment: string }>(
  email: string,
  sendEmail: (recipient: string, args: T) => Promise<EmailResponse>,
  args: T,
  delayMs: number,
) {
  try {
    await sendEmail(email, args)
  } catch (error) {
    logger.error(`Error sending email: ${error}`)
  }

  await new Promise(resolve => setTimeout(resolve, delayMs))
}
