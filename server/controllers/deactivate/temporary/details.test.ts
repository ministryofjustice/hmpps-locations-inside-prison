import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivate/fields'
import DeactivateTemporaryDetails from './details'
import { Services } from '../../../services'

describe('DeactivateTemporaryDetails', () => {
  const controller = new DeactivateTemporaryDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response
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
    req = {
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
        get: jest.fn((fieldName?: keyof typeof formValues) => formValues[fieldName]),
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
        values: formValues,
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('validateFields', () => {
    it('sets deactivationReasonDescription to the correct value', () => {
      req.body = {
        'deactivationReasonDescription-TEST1': 'test1',
        'deactivationReasonDescription-TEST2': 'test2',
        'deactivationReasonDescription-TEST3': 'test3',
      }
      req.form.values.deactivationReason = 'TEST2'
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(req.form.values.deactivationReasonDescription).toEqual('test2')
    })
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      res.locals.errorlist = [
        {
          key: 'deactivationReasonOther',
          type: 'required',
          url: '/',
        },
      ]
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields,
        validationErrors: [
          {
            href: '#deactivationReasonOther',
            text: 'Enter a deactivation reason',
          },
        ],
      })
    })

    it('returns the expected locals when the back link is already set', () => {
      res.locals.backLink = '/last/step'
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/last/step',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields,
        validationErrors: [],
      })
    })
  })

  describe('populateItems', () => {
    it('populates the items ', async () => {
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getDeactivatedReasons: () => ({ ATEST1: 'A test 1', OTHER: 'Other', TEST2: 'Test 2' }),
        },
      } as unknown as Services

      const callback = jest.fn()
      await controller.populateItems(req, res, callback)

      expect(req.form.options.fields.deactivationReason.items).toEqual([
        {
          conditional: 'deactivationReasonDescription-ATEST1',
          text: 'A test 1',
          value: 'ATEST1',
        },
        {
          conditional: 'deactivationReasonDescription-TEST2',
          text: 'Test 2',
          value: 'TEST2',
        },
        {
          conditional: 'deactivationReasonOther',
          text: 'Other',
          value: 'OTHER',
        },
      ])

      expect(
        Object.fromEntries(
          Object.entries(req.form.options.allFields).filter(([n, _]) => n.startsWith('deactivationReasonDescription')),
        ),
      ).toEqual({
        'deactivationReasonDescription-ATEST1': {
          ...fields.deactivationReasonDescription,
          id: 'deactivationReasonDescription-ATEST1',
          name: 'deactivationReasonDescription-ATEST1',
        },
        'deactivationReasonDescription-TEST2': {
          ...fields.deactivationReasonDescription,
          id: 'deactivationReasonDescription-TEST2',
          name: 'deactivationReasonDescription-TEST2',
        },
      })
    })
  })
})
