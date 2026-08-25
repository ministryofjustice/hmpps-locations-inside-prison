import { NotFound } from 'http-errors'
import logger from '../../logger'

import validateCaseload from './validateCaseload'

jest.mock('../../logger', () => ({
  info: jest.fn(),
}))

describe('validateCaseload', () => {
  let req: any
  let res: any
  let next: jest.Mock
  let getCaseloads: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    getCaseloads = jest.fn().mockResolvedValue([{ id: 'TST' }])
    req = {
      services: {
        manageUsersService: {
          getCaseloads,
        },
      },
      session: {
        systemToken: 'system-token',
      },
    }
    res = {
      locals: {
        user: { caseloads: [{ id: 'TST' }] },
        prisonId: 'TST',
      },
    }
    next = jest.fn()
  })

  it('calls next with no error if caseload is accessible', async () => {
    await validateCaseload(req, res, next)

    expect(getCaseloads).toHaveBeenCalledWith('system-token')
    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with NotFound if caseload does not exist', async () => {
    res.locals.prisonId = 'MDI'
    getCaseloads.mockResolvedValue([{ id: 'TST' }])

    await validateCaseload(req, res, next)

    expect(getCaseloads).toHaveBeenCalledWith('system-token')
    expect(next).toHaveBeenCalledWith(expect.any(NotFound))
    expect(logger.info).not.toHaveBeenCalled()
  })

  it('calls next with error if caseload is not in users caseloads', async () => {
    res.locals.prisonId = 'MDI'
    getCaseloads.mockResolvedValue([{ id: 'MDI' }])

    await validateCaseload(req, res, next)

    expect(getCaseloads).toHaveBeenCalledWith('system-token')
    expect(next).toHaveBeenCalledWith(expect.any(Error))
    expect(next.mock.calls[0][0].message).toBe('Caseload is not accessible by this user.')
    expect(logger.info).toHaveBeenCalledWith('Caseload MDI is not accessible by this user.')
  })
})
