import { NotifyClient } from 'notifications-node-client'
import config from '../config'
import logger from '../../logger'

const { templates } = config.email

export default class NotificationService {
  constructor(private readonly emailClient: NotifyClient) {}

  async notify(notificationDetails: NotificationDetails) {
    const { enabled } = config.email
    if (enabled === 'true' || enabled === true) {
      await this.batchSend(notificationDetails)
    } else {
      const { notifyDevUsers } = config.email
      logger.info(`NOTIFY_ENABLED is ${config.email.enabled} sending to ${notifyDevUsers} instead`)
      const emailsOfDevUsers = notifyDevUsers !== undefined ? notifyDevUsers.split(',') : []
      const devUserNotificationDetails: NotificationDetails = {
        ...notificationDetails,
        emailAddress: emailsOfDevUsers,
      }
      await this.batchSend(devUserNotificationDetails)
    }
  }

  // TODO: This will be updated with appInsights (MAP-2814) to include error response logging.
  private async batchSend(notificationDetails: NotificationDetails, delayMs = 10): Promise<void> {
    const templateId = getTemplateId(notificationDetails.type)
    logger.info(`Send of ${notificationDetails.emailAddress.length} ${notificationDetails.type} emails`)

    let emailsSent = 0

    await notificationDetails.emailAddress.reduce(async (previousPromise, email) => {
      await previousPromise
      const success = await this.sendWithDelay(templateId, email, notificationDetails)
      if (success) {
        emailsSent += 1
      }

      await this.delay(delayMs)
    }, Promise.resolve())

    logger.info(
      `Finished batch send of emails for ${notificationDetails.establishment}. Successfully sent ${emailsSent} ${notificationDetails.type} emails`,
    )
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
      logger.error(`Error sending email: ${error}, error sending email to ${email}`)
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
