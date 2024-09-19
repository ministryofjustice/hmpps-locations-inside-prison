import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { Services } from '../services'
import getResidentialSummary from './getResidentialSummary'

describe('getResidentialSummary', () => {
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {} as unknown as FormWizard.Request
    res = {
      locals: {
        user: { username: 'username' },
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  it('calls the correct locations service call', async () => {
    req.services = {
      authService: {
        getSystemClientToken: () => 'token',
      },
      locationsService: {
        getResidentialSummary: jest.fn(),
      },
    } as unknown as Services
    const callback = jest.fn()
    await getResidentialSummary(req, res, callback)

    expect(req.services.locationsService.getResidentialSummary).toHaveBeenCalledWith(
      'token',
      res.locals.location.prisonId,
    )
  })
})
