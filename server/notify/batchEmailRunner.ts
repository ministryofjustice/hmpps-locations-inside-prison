import logger from '../../logger'
import { EmailResponse } from '../services/notificationService'

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function sendEmailWithDelay<T extends { establishment: string }>(
  email: string,
  sendEmail: (recipient: string, args: T) => Promise<EmailResponse>,
  args: T,
): Promise<boolean> {
  try {
    await sendEmail(email, args)
    return true
  } catch (error) {
    logger.error(`Error sending email: ${error}`)
    return false
  }

//   add in app insights - seperate ticket as follow up.
}

export default async function batchSendEmails<T extends { establishment: string }>(
  recipients: string[],
  sendEmail: (recipient: string, args: T) => Promise<EmailResponse>,
  args: T,
  delayMs = 10,
): Promise<void> {
  logger.info(`Starting batch send of ${recipients.length} emails`)

  let emailsSent = 0

  await recipients.reduce(async (previousPromise, email) => {
    await previousPromise
    const success = await sendEmailWithDelay(email, sendEmail, args)
    if (success) {
      emailsSent += 1
    }

    await delay(delayMs)
  }, Promise.resolve())

  logger.info(
    `Finished batch send of emails for ${args.establishment}. Successfully sent ${emailsSent} of ${recipients.length} emails`,
  )
}
