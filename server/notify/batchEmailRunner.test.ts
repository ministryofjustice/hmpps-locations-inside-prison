import batchSendEmails from './batchEmailRunner'
import logger from '../../logger'

describe('batchSendEmails', () => {
  let sendEmail: jest.Mock
  const recipients = ['test1@email.com', 'test2@email.com', 'test3@email.com']
  const args = { establishment: 'MDI' }

  beforeEach(() => {
    sendEmail = jest.fn()
    jest.spyOn(logger, 'info').mockImplementation(() => {})
    jest.spyOn(logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('successfully sends emails to all recipients', async () => {
    sendEmail.mockResolvedValue({})

    await batchSendEmails(recipients, sendEmail, args, 0)

    expect(sendEmail).toHaveBeenCalledTimes(recipients.length)
    expect(logger.info).toHaveBeenCalledWith(`Starting batch send of ${recipients.length} emails`)
    expect(logger.info).toHaveBeenCalledWith(
      `Finished batch send of emails for MDI. Successfully sent ${recipients.length} of ${recipients.length} emails`,
    )
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('logs errors for any unsuccessful emails', async () => {
    sendEmail.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce({})

    await batchSendEmails(recipients, sendEmail, args, 0)

    expect(sendEmail).toHaveBeenCalledTimes(recipients.length)
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Error sending email'))
    expect(logger.info).toHaveBeenCalledWith(
      `Finished batch send of emails for MDI. Successfully sent 2 of ${recipients.length} emails`,
    )
  })
})
