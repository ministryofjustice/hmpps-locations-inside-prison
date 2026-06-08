import { NotifyClient } from 'notifications-node-client'
import NotificationService, { NotificationDetails, NotificationType } from './notificationService'
import config from '../config'
import logger from '../../logger'

jest.mock('notifications-node-client')
jest.mock('../../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}))

jest.mock('../config', () => {
  return {
    email: {
      enabled: true,
      devUser: 'dev@example.com',
      templates: {
        CHANGE_REQUEST_RECEIVED: 'template-id-received',
        CHANGE_REQUEST_SUBMITTED: 'template-id-submitted',
        CHANGE_REQUEST_APPROVED: 'template-id-approved',
        CHANGE_REQUEST_WITHDRAWN: 'template-id-withdrawn',
        CHANGE_REQUEST_REJECTED: 'template-id-rejected',
      },
    },
  }
})

describe('NotificationService', () => {
  const mockSendEmail = jest.fn()

  const mockNotifyClient = {
    sendEmail: mockSendEmail,
  } as unknown as NotifyClient

  const baseNotificationDetails: NotificationDetails = {
    type: NotificationType.REQUEST_RECEIVED,
    emailAddresses: ['user1@example.com', 'user2@example.com'],
    establishment: 'Test Establishment',
    submittedBy: 'John Doe',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('NotificationService (enabled mode)', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const baseDetails: Partial<NotificationDetails> = {
      emailAddresses: ['user1@example.com', 'user2@example.com'],
      establishment: 'Test Establishment',
      submittedBy: 'John Doe',
      location: 'Test Location',
      changeType: 'Test Change',
      submittedOn: '2025-09-26',
      withdrawnBy: 'Jack Withdrawer',
      withdrawReason: 'Test Reason',
      rejectedBy: 'John Rejecter',
      rejectionReason: 'Test Reason',
    }

    const testCases: { type: NotificationType; expectedPersonalisation: Record<string, string | string[]> }[] = [
      {
        type: NotificationType.REQUEST_RECEIVED,
        expectedPersonalisation: {
          SUBMITTED_BY: 'John Doe',
          ESTABLISHMENT: 'Test Establishment',
        },
      },
      {
        type: NotificationType.REQUEST_SUBMITTED,
        expectedPersonalisation: {
          SUBMITTED_BY: 'John Doe',
          ESTABLISHMENT: 'Test Establishment',
        },
      },
      {
        type: NotificationType.REQUEST_APPROVED,
        expectedPersonalisation: {
          ESTABLISHMENT: 'Test Establishment',
        },
      },
      {
        type: NotificationType.REQUEST_WITHDRAWN,
        expectedPersonalisation: {
          ESTABLISHMENT: 'Test Establishment',
          LOCATION: 'Test Location',
          CHANGE_TYPE: 'Test Change',
          SUBMITTED_ON: '2025-09-26',
          SUBMITTED_BY: 'John Doe',
          WITHDRAWN_BY: 'Jack Withdrawer',
          WITHDRAW_REASON: 'Test Reason',
        },
      },
      {
        type: NotificationType.REQUEST_REJECTED,
        expectedPersonalisation: {
          ESTABLISHMENT: 'Test Establishment',
          LOCATION: 'Test Location',
          CHANGE_TYPE: 'Test Change',
          SUBMITTED_ON: '2025-09-26',
          SUBMITTED_BY: 'John Doe',
          REJECTED_BY: 'John Rejecter',
          REJECTION_REASON: 'Test Reason',
        },
      },
    ]

    testCases.forEach(({ type, expectedPersonalisation }) => {
      it(`should send ${type} emails to both recipients`, async () => {
        const details: NotificationDetails = {
          ...baseDetails,
          type,
          emailAddresses: ['user1@example.com', 'user2@example.com'],
        } as NotificationDetails

        const service = new NotificationService(mockNotifyClient)
        await service.notify(details)

        expect(mockSendEmail).toHaveBeenCalledTimes(2)
        expect(mockSendEmail).toHaveBeenCalledWith(config.email.templates[`CHANGE_${type}`], 'user1@example.com', {
          personalisation: expectedPersonalisation,
        })
        expect(mockSendEmail).toHaveBeenCalledWith(config.email.templates[`CHANGE_${type}`], 'user2@example.com', {
          personalisation: expectedPersonalisation,
        })
      })
    })
  })

  it('should log error if sendEmail fails', async () => {
    mockSendEmail.mockRejectedValueOnce(new Error('Send failed'))

    const service = new NotificationService(mockNotifyClient)
    await service.notify(baseNotificationDetails)

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Email failed to send'))
    expect(logger.info).toHaveBeenCalledWith(
      'Starting batch send for Test Establishment. Sending 2 REQUEST_RECEIVED emails to GovUK Notify.',
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Finished batch send for Test Establishment. Sent 1/2 REQUEST_RECEIVED emails to GovUK Notify.',
    )
    expect(logger.info).toHaveBeenCalledWith(
      'Failed to send 1 REQUEST_RECEIVED emails for Test Establishment. Check GovUK Notify dashboard for details.',
    )
  })
})
