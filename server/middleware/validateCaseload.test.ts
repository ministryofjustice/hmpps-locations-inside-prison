import validateCaseload from './validateCaseload'

describe('validateCaseload', () => {
  let req: any
  let res: any
  let next: jest.Mock

  beforeEach(() => {
    req = {}
    res = {
      locals: {
        user: { caseloads: [{ id: 'TST' }] },
        prisonId: 'TST',
      },
    }
    next = jest.fn()
  })

  it('calls next with no error if caseload is accessible', async () => {
    await validateCaseload()(req, res, next)
    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with error if caseload is not in users caseloads', async () => {
    res.locals.prisonId = 'MDI'
    await validateCaseload()(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.any(Error))
    expect(next.mock.calls[0][0].message).toBe('Caseload is not accessible by this user.')
  })
})
