import { NotifyClient } from 'notifications-node-client'
import config from '../config'
import logger from '../../logger'

const { templates } = config.email

export default class NotificationService {
  constructor(private readonly emailClient: NotifyClient) {}

  async notify(notificationDetails: NotificationDetails) {
    await this.batchSend(notificationDetails)
  }

  private async batchSend(notificationDetails: NotificationDetails, delayMs = 10): Promise<void> {
    const templateId = getTemplateId(notificationDetails.type)
    const totalEmails = notificationDetails.emailAddress.length
    logger.info(
      `Starting batch send for ${notificationDetails.establishment}. Sending ${totalEmails} ${notificationDetails.type} emails to GovUK Notify.`,
    )

    let emailsSent = 0
    const emailsFailed: string[] = []

    await notificationDetails.emailAddress.reduce(async (previousPromise, email) => {
      await previousPromise
      const success = await this.sendWithDelay(templateId, email, notificationDetails)
      if (success) {
        emailsSent += 1
      } else {
        emailsFailed.push(email)
      }

      await this.delay(delayMs)
    }, Promise.resolve())

    logger.info(
      `Finished batch send for ${notificationDetails.establishment}. Sent ${emailsSent}/${totalEmails} ${notificationDetails.type} emails to GovUK Notify.`,
    )

    if (emailsFailed.length > 0) {
      logger.info(
        `Failed to send ${emailsFailed.length} ${notificationDetails.type} emails for ${notificationDetails.establishment}. Check GovUK Notify dashboard for details.`,
      )
    }
  }

  private async sendWithDelay(
    templateId: string,
    email: string,
    notificationDetails: NotificationDetails,
  ): Promise<boolean> {
    try {
      await this.emailClient.sendEmail(templateId, email, {
        personalisation: getPersonalisation(notificationDetails),
      })
      return true
    } catch (error) {
      logger.error(`Email failed to send to GovUk Notify for ${notificationDetails.establishment}. ${error}`)
      return false
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }
}

export type NotificationDetails = {
  type: NotificationType
  emailAddress: string[]
  establishment: string
  url?: string
  location?: string
  changeType?: string
  submittedOn?: string
  submittedBy?: string
  who?: string
  reason?: string
}

export enum NotificationType {
  REQUEST_RECEIVED = 'REQUEST_RECEIVED',
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_WITHDRAWN = 'REQUEST_WITHDRAWN',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
}

const getTemplateId = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.REQUEST_RECEIVED:
      return templates.CHANGE_REQUEST_RECEIVED
    case NotificationType.REQUEST_SUBMITTED:
      return templates.CHANGE_REQUEST_SUBMITTED
    case NotificationType.REQUEST_APPROVED:
      return templates.CHANGE_REQUEST_APPROVED
    case NotificationType.REQUEST_WITHDRAWN:
      return templates.CHANGE_REQUEST_WITHDRAWN
    case NotificationType.REQUEST_REJECTED:
      return templates.CHANGE_REQUEST_REJECTED
    default:
      throw new Error(`Unsupported notification type: ${type}`)
  }
}

const getPersonalisation = (notificationDetails: NotificationDetails): Record<string, string | string[]> => {
  switch (notificationDetails.type) {
    case NotificationType.REQUEST_RECEIVED:
      return {
        SUBMITTED_BY: notificationDetails.submittedBy,
        ESTABLISHMENT: notificationDetails.establishment,
        URL: notificationDetails.url,
      }
    case NotificationType.REQUEST_SUBMITTED:
      return {
        SUBMITTED_BY: notificationDetails.submittedBy,
        ESTABLISHMENT: notificationDetails.establishment,
      }
    case NotificationType.REQUEST_APPROVED:
      return {
        ESTABLISHMENT: notificationDetails.establishment,
      }
    case NotificationType.REQUEST_WITHDRAWN:
      return {
        ESTABLISHMENT: notificationDetails.establishment,
        LOCATION: notificationDetails.location,
        CHANGE_TYPE: notificationDetails.changeType,
        SUBMITTED_ON: notificationDetails.submittedOn,
        SUBMITTED_BY: notificationDetails.submittedBy,
        WITHDRAWN_BY: notificationDetails.who,
        WITHDRAW_REASON: notificationDetails.reason,
      }
    case NotificationType.REQUEST_REJECTED:
      return {
        ESTABLISHMENT: notificationDetails.establishment,
        LOCATION: notificationDetails.location,
        CHANGE_TYPE: notificationDetails.changeType,
        SUBMITTED_ON: notificationDetails.submittedOn,
        SUBMITTED_BY: notificationDetails.submittedBy,
        REJECTION_BY: notificationDetails.who,
        REJECTION_REASON: notificationDetails.reason,
      }
    default:
      throw new Error(`Unsupported notification type: ${notificationDetails.type}`)
  }
}
