import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeSignedOperationalCapacity from './index'
import fields from '../../routes/changeSignedOperationalCapacity/fields'

describe('ChangeSignedOperationalCapacity', () => {
  const controller = new ChangeSignedOperationalCapacity({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {
      form: {
        options: {
          fields,
        },
        values: {
          newSignedOperationalCapacity: 14,
          prisonGovernorApproval: true,
        },
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        errorlist: [],
        prisonId: 'TST',
        maxCapacity: 30,
        currentSignedOperationalCapacity: 25,
        options: {
          fields,
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('validateFields', () => {
    it('does not allow signed operational capacity to exceed max capacity', () => {
      req.form.values = { newSignedOperationalCapacity: '31', prisonGovernorApproval: 'yes' }

      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({
        newSignedOperationalCapacity: {
          args: {},
          key: 'newSignedOperationalCapacity',
          type: 'doesNotExceedEstMaxCap',
        },
      })
    })
  })

  describe('validate', () => {
    it('redirects to the show location page when there are no changes', () => {
      req.form.values = { newSignedOperationalCapacity: '25', prisonGovernorApproval: 'yes' }
      res.redirect = jest.fn()
      controller.validate(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST')
    })
  })
})
