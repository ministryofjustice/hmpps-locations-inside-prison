import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/deactivate/fields'
import DeactivateTemporaryDetails from './details'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('DeactivateTemporaryDetails', () => {
  const controller = new DeactivateTemporaryDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let formValues: {
    deactivationReason: string
    estimatedReactivationDate: string
    planetFmReference: string
    deactivationReasonDescription: string
    deactivationReasonOther: string
  }

  beforeEach(() => {
    formValues = {
      deactivationReason: 'OTHER',
      deactivationReasonDescription: 'Description',
      deactivationReasonOther: 'Other',
      estimatedReactivationDate: '2030-04-20',
      planetFmReference: 'PFMRN123',
    }
    deepReq = {
      body: {
        'deactivationReasonDescription-DAMAGE': 'Damage',
        'estimatedReactivationDate-day': '20',
        'estimatedReactivationDate-month': '4',
        'estimatedReactivationDate-year': '2030',
      },
      form: {
        options: {
          allFields: Object.fromEntries(Object.entries(fields)),
          fields: Object.fromEntries(
            Object.entries(fields).filter(
              ([n, _]) => !['deactivationReasonDescription', 'deactivationReasonOther'].includes(n),
            ),
          ),
        },
        values: formValues,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: keyof typeof formValues) => formValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
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
        values: formValues,
      },
      redirect: jest.fn(),
    }
  })

  describe('validateFields', () => {
    it('sets deactivationReasonDescription to the correct value', () => {
      deepReq.body = {
        'deactivationReasonDescription-TEST1': 'test1',
        'deactivationReasonDescription-TEST2': 'test2',
        'deactivationReasonDescription-TEST3': 'test3',
      }
      deepReq.form.values.deactivationReason = 'TEST2'
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(deepReq.form.values.deactivationReasonDescription).toEqual('test2')
    })
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      deepRes.locals.errorlist = [
        {
          key: 'deactivationReasonOther',
          type: 'required',
          url: '/',
        },
      ]
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields,
        title: 'Deactivation details',
        titleCaption: 'Cell A-1-001',
        validationErrors: [
          {
            href: '#deactivationReasonOther',
            text: 'Enter a deactivation reason',
          },
        ],
      })
    })

    it('returns the expected locals when the back link is already set', () => {
      deepRes.locals.backLink = '/last/step'
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/last/step',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields,
        title: 'Deactivation details',
        titleCaption: 'Cell A-1-001',
        validationErrors: [],
      })
    })
  })
})
