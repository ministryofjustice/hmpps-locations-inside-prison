import logger from '../../logger'
import { createNotificationService, WithdrawnChangeEmailArgs, RejectedChangeEmailArgs } from './notificationService'
import config from '../config'

describe('Notification Service', () => {
  let emailClient: { sendEmail: jest.Mock }
  let notificationService: ReturnType<typeof createNotificationService>

  beforeEach(() => {
    emailClient = { sendEmail: jest.fn() }
    notificationService = createNotificationService(emailClient)

    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  describe('sendEmail', () => {
    it('returns the email response from sendEmail', async () => {
      const mockResponse = {
        id: 'email-id',
        content: {
          subject: 'Subject',
          body: 'Body',
          from_email: 'joebloggs@email.com',
        },
        uri: 'https://email.uri',
        template: {
          id: config.email.templates.CHANGE_REQUEST_RECEIVED,
          uri: 'https://template.uri',
        },
      }

      emailClient.sendEmail.mockResolvedValue(mockResponse)

      const result = await notificationService.sendChangeRequestReceivedEmail('test@email.com', 'Joe', 'MDI')

      expect(result).toEqual(mockResponse)
    })

    it('returns null if sendEmail fails', async () => {
      emailClient.sendEmail.mockRejectedValue(new Error('Email service failed'))

      const result = await notificationService.sendChangeRequestReceivedEmail('test@email.com', 'Joe', 'MDI')

      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send CHANGE_REQUEST_RECEIVED email for MDI'),
      )
    })
  })

  describe('sendChangeRequestReceivedEmail', () => {
    it('calls sendEmail with correct template and personalisation', async () => {
      await notificationService.sendChangeRequestReceivedEmail('test@email.com', 'Joe', 'MDI')
      expect(emailClient.sendEmail).toHaveBeenCalledWith(
        config.email.templates.CHANGE_REQUEST_RECEIVED,
        'test@email.com',
        {
          personalisation: { SUBMITTED_BY: 'Joe', ESTABLISHMENT: 'MDI' },
        },
      )
    })
  })

  describe('sendChangeRequestSubmittedEmail', () => {
    it('calls sendEmail with correct template and personalisation', async () => {
      await notificationService.sendChangeRequestSubmittedEmail('test@email.com', 'Joe', 'MDI')
      expect(emailClient.sendEmail).toHaveBeenCalledWith(
        config.email.templates.CHANGE_REQUEST_SUBMITTED,
        'test@email.com',
        {
          personalisation: { SUBMITTED_BY: 'Joe', ESTABLISHMENT: 'MDI' },
        },
      )
    })
  })

  describe('sendRequestApprovalEmail', () => {
    it('calls sendEmail with correct template and personalisation', async () => {
      await notificationService.sendRequestApprovalEmail('test@email.com', 'MDI')
      expect(emailClient.sendEmail).toHaveBeenCalledWith(
        config.email.templates.CHANGE_REQUEST_APPROVED,
        'test@email.com',
        {
          personalisation: { ESTABLISHMENT: 'MDI' },
        },
      )
    })
  })

  describe('sendChangeRequestWithdrawnEmail', () => {
    it('calls sendEmail with correct template and personalisation', async () => {
      const args: WithdrawnChangeEmailArgs = {
        establishment: 'MDI',
        location: 'WING A',
        changeType: 'Change 1',
        submittedOn: '2020-02-02',
        submittedBy: 'Joe',
        withdrawnBy: 'Bloggs',
        withdrawReason: 'Mistake',
      }
      await notificationService.sendChangeRequestWithdrawnEmail('test@email.com', args)
      expect(emailClient.sendEmail).toHaveBeenCalledWith(
        config.email.templates.CHANGE_REQUEST_WITHDRAWN,
        'test@email.com',
        {
          personalisation: {
            ESTABLISHMENT: 'MDI',
            LOCATION: 'WING A',
            CHANGE_TYPE: 'Change 1',
            SUBMITTED_ON: '2020-02-02',
            SUBMITTED_BY: 'Joe',
            WITHDRAWN_BY: 'Bloggs',
            WITHDRAW_REASON: 'Mistake',
          },
        },
      )
    })
  })

  describe('sendChangeRequestRejectionEmail', () => {
    it('calls sendEmail with correct template and personalisation', async () => {
      const args: RejectedChangeEmailArgs = {
        establishment: 'MDI',
        location: 'WING A',
        changeType: 'Change 1',
        submittedOn: '2020-02-02',
        submittedBy: 'Joe',
        rejectionBy: 'Bloggs',
        rejectionReason: 'Mistake',
      }
      await notificationService.sendChangeRequestRejectionEmail('test@email.com', args)
      expect(emailClient.sendEmail).toHaveBeenCalledWith(
        config.email.templates.CHANGE_REQUEST_REJECTED,
        'test@email.com',
        {
          personalisation: {
            ESTABLISHMENT: 'MDI',
            LOCATION: 'WING A',
            CHANGE_TYPE: 'Change 1',
            SUBMITTED_ON: '2020-02-02',
            SUBMITTED_BY: 'Joe',
            REJECTION_BY: 'Bloggs',
            REJECTION_REASON: 'Mistake',
          },
        },
      )
    })
  })
})
