// @ts-expect-error @ts-ignore
import { NotifyClient } from 'notifications-node-client'
import config from '../config'
import logger from '../../logger'

const {
  email: { enabled, notifyKey, templates },
} = config

interface EmailClient {
  sendEmail: (
    templateId: string,
    emailAddress: string,
    options?: {
      personalisation?: Record<string, string | string[]>
      reference?: string | null
      emailReplyToId?: string
      oneClickUnsubscribeURL?: string
    },
  ) => Promise<EmailResponse>
}

export interface EmailResponse {
  id: string
  reference?: string
  content: {
    subject: string
    body: string
    from_email: string
    one_click_unsubscribe_url?: string
  }
  uri: string
  template: {
    id: string
    version: number
    uri: string
  }
}

export interface WithdrawnChangeEmailArgs {
  establishment: string
  location: string
  changeType: string
  submittedOn: string
  submittedBy: string
  withdrawnBy: string
  withdrawReason: string
}

export interface RejectedChangeEmailArgs {
  establishment: string
  location: string
  changeType: string
  submittedOn: string
  submittedBy: string
  rejectionBy: string
  rejectionReason: string
}

export interface NotificationService {
  sendChangeRequestReceivedEmail: (
    emailAddress: string,
    submittedBy: string,
    establishment: string,
  ) => Promise<EmailResponse>
  sendChangeRequestSubmittedEmail: (
    emailAddress: string,
    submittedBy: string,
    establishment: string,
  ) => Promise<EmailResponse>
  sendRequestApprovalEmail: (emailAddress: string, establishment: string) => Promise<EmailResponse>
  sendChangeRequestWithdrawnEmail: (emailAddress: string, args: WithdrawnChangeEmailArgs) => Promise<EmailResponse>
  sendChangeRequestRejectionEmail: (emailAddress: string, args: RejectedChangeEmailArgs) => Promise<EmailResponse>
}

export const createNotificationService = (emailClient: EmailClient): NotificationService => {
  const sendChangeRequestReceivedEmail = async (
    emailAddress: string,
    submittedBy: string,
    establishment: string,
  ): Promise<EmailResponse> => {
    try {
      return await emailClient.sendEmail(templates.CHANGE_REQUEST_RECEIVED, emailAddress, {
        personalisation: {
          SUBMITTED_BY: submittedBy,
          ESTABLISHMENT: establishment,
        },
      })
    } catch (error) {
      logger.error(`Failed to send CHANGE_REQUEST_RECEIVED email for ${establishment}. Error: ${error}`)
      return null
    }
  }

  const sendChangeRequestSubmittedEmail = async (
    emailAddress: string,
    submittedBy: string,
    establishment: string,
  ): Promise<EmailResponse> => {
    try {
      return await emailClient.sendEmail(templates.CHANGE_REQUEST_SUBMITTED, emailAddress, {
        personalisation: {
          SUBMITTED_BY: submittedBy,
          ESTABLISHMENT: establishment,
        },
      })
    } catch (error) {
      logger.error(`Failed to send CHANGE_REQUEST_SUBMITTED email for ${establishment}. Error: ${error}`)
      return null
    }
  }

  const sendRequestApprovalEmail = async (emailAddress: string, establishment: string): Promise<EmailResponse> => {
    try {
      return await emailClient.sendEmail(templates.CHANGE_REQUEST_APPROVED, emailAddress, {
        personalisation: {
          ESTABLISHMENT: establishment,
        },
      })
    } catch (error) {
      logger.error(`Failed to send CHANGE_REQUEST_APPROVED email for ${establishment}. Error: ${error}`)
      return null
    }
  }

  const sendChangeRequestWithdrawnEmail = async (
    emailAddress: string,
    {
      establishment,
      location,
      changeType,
      submittedOn,
      submittedBy,
      withdrawnBy,
      withdrawReason,
    }: WithdrawnChangeEmailArgs,
  ): Promise<EmailResponse> => {
    try {
      return await emailClient.sendEmail(templates.CHANGE_REQUEST_WITHDRAWN, emailAddress, {
        personalisation: {
          ESTABLISHMENT: establishment,
          LOCATION: location,
          CHANGE_TYPE: changeType,
          SUBMITTED_ON: submittedOn,
          SUBMITTED_BY: submittedBy,
          WITHDRAWN_BY: withdrawnBy,
          WITHDRAW_REASON: withdrawReason,
        },
      })
    } catch (error) {
      logger.error(`Failed to send CHANGE_REQUEST_WITHDRAWN email for ${establishment}. Error: ${error}`)
      return null
    }
  }

  const sendChangeRequestRejectionEmail = async (
    emailAddress: string,
    {
      establishment,
      location,
      changeType,
      submittedOn,
      submittedBy,
      rejectionBy,
      rejectionReason,
    }: RejectedChangeEmailArgs,
  ): Promise<EmailResponse> => {
    try {
      return await emailClient.sendEmail(templates.CHANGE_REQUEST_REJECTED, emailAddress, {
        personalisation: {
          ESTABLISHMENT: establishment,
          LOCATION: location,
          CHANGE_TYPE: changeType,
          SUBMITTED_ON: submittedOn,
          SUBMITTED_BY: submittedBy,
          REJECTION_BY: rejectionBy,
          REJECTION_REASON: rejectionReason,
        },
      })
    } catch (error) {
      logger.error(`Failed to send CHANGE_REQUEST_REJECTED email for ${establishment}. Error: ${error}`)
      return null
    }
  }

  return {
    sendChangeRequestReceivedEmail,
    sendChangeRequestSubmittedEmail,
    sendRequestApprovalEmail,
    sendChangeRequestWithdrawnEmail,
    sendChangeRequestRejectionEmail,
  }
}

export const notificationServiceFactory = (): NotificationService => {
  const stubClient: EmailClient = {
    sendEmail: async (templateId, emailAddress, options) => {
      logger.info(`Stubbed sendEmail: ${JSON.stringify({ templateId, emailAddress, options })}`)
      return {
        id: 'stubId',
        reference: options?.reference ?? null,
        content: {
          subject: 'Stub subject',
          body: 'Stub body',
          from_email: 'stub@example.com',
        },
        uri: 'https://stubbed.uri',
        template: {
          id: templateId,
          version: 1,
          uri: `https://stubbed.uri/${templateId}`,
        },
      }
    },
  }

  const notifyClient = enabled === true ? new NotifyClient(notifyKey) : stubClient
  return createNotificationService(notifyClient)
}
