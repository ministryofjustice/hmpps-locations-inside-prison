import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../routes/deactivateTemporary/fields'
import DeactivateTemporaryDetails from './details'
import { Services } from '../../services'

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
          fields,
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
        backLink: '/referrer-url',
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
          text: 'A test 1',
          value: 'ATEST1',
          conditional: 'deactivationReasonDescription',
        },
        {
          text: 'Test 2',
          value: 'TEST2',
          conditional: 'deactivationReasonDescription',
        },
        {
          text: 'Other',
          value: 'OTHER',
          conditional: 'deactivationReasonOther',
        },
      ])
    })
  })

  describe('differentiateConditionalFields', () => {
    beforeEach(async () => {
      req.form.options.fields.deactivationReason.items = [
        {
          value: 'ATEST1',
          conditional: {
            html: 'name="deactivationReasonDescription" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'name="deactivationReasonDescription" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'name="deactivationReasonOther" test',
          },
        },
      ] as FormWizard.Field['items']

      req.form.options.fields.deactivationReasonDescription.dependent = { field: 'testField', value: 'testValue' }

      const callback = jest.fn()
      controller.differentiateConditionalFields(req, res, callback)
    })

    it('sets deactivationReasonDescription.dependent.value ', () => {
      expect(req.form.options.fields.deactivationReasonDescription.dependent.value).toEqual(['ATEST1', 'TEST2'])
    })

    it('differentiates the names of each conditional', () => {
      expect(req.form.options.fields.deactivationReason.items).toEqual([
        {
          value: 'ATEST1',
          conditional: {
            html: 'name="deactivationReasonDescription-ATEST1" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'name="deactivationReasonDescription-TEST2" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'name="deactivationReasonOther" test',
          },
        },
      ])
    })
  })

  describe('setDescriptionFields', () => {
    beforeEach(async () => {
      req.form.options.fields.deactivationReason.items = [
        {
          value: 'ATEST1',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'type="text" test',
          },
        },
      ] as FormWizard.Field['items']
    })

    it('sets the correct value for ATEST1', () => {
      req.form.options.fields.deactivationReason.value = 'ATEST1'
      req.form.options.fields.deactivationReasonDescription.value = 'a "test" 1'

      controller.setDescriptionFields(req)

      expect(req.form.options.fields.deactivationReason.items).toEqual([
        {
          value: 'ATEST1',
          conditional: {
            html: 'type="text" value="a &quot;test&quot; 1" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'type="text" test',
          },
        },
      ])
    })

    it('sets the correct value for TEST2', () => {
      req.form.options.fields.deactivationReason.value = 'TEST2'
      req.form.options.fields.deactivationReasonDescription.value = '"test" 2'

      controller.setDescriptionFields(req)

      expect(req.form.options.fields.deactivationReason.items).toEqual([
        {
          value: 'ATEST1',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'type="text" value="&quot;test&quot; 2" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'type="text" test',
          },
        },
      ])
    })

    it('sets the correct value for OTHER', () => {
      req.form.options.fields.deactivationReason.value = 'OTHER'
      req.form.options.fields.deactivationReasonOther.value = '"other" value'

      controller.setDescriptionFields(req)

      expect(req.form.options.fields.deactivationReason.items).toEqual([
        {
          value: 'ATEST1',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'TEST2',
          conditional: {
            html: 'type="text" test',
          },
        },
        {
          value: 'OTHER',
          conditional: {
            html: 'type="text" value="&quot;other&quot; value" test',
          },
        },
      ])
    })
  })
})
