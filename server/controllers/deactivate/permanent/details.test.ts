import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import DeactivatePermanentDetails from './details'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('DeactivatePermanentDetails', () => {
  const controller = new DeactivatePermanentDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
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
        get: jest.fn(_ => 'wing disintegrated') as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
        }),
        options: {
          fields,
        },
        prisonerLocation: {
          prisoners: [],
        },
        prisonResidentialSummary: {
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
    }
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      deepRes.locals.errorlist = [
        {
          key: 'permanentDeactivationReason',
          type: 'required',
          url: '/',
        },
      ]
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

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
