import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import DeactivatePermanentDetails from './details'

describe('DeactivatePermanentDetails', () => {
  const controller = new DeactivatePermanentDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {
      form: {
        options: {
          fields,
        },
        values: {
          permanentDeactivationReason: 'wing disintegrated',
        },
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn(_ => 'wing disintegrated'),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
        },
        options: {
          fields,
        },
        prisonerLocation: {
          prisoners: [],
        },
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        values: {
          permanentDeactivationReason: 'wing disintegrated',
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      res.locals.errorlist = [
        {
          key: 'permanentDeactivationReason',
          type: 'required',
          url: '/',
        },
      ]
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields,
        validationErrors: [
          {
            href: '#permanentDeactivationReason',
            text: 'Enter a reason for permanently deactivating the location',
          },
        ],
      })
    })
  })
})
