import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../routes/deactivate/fields'
import ChangeTemporaryDeactivationDetails from './details'
import { Services } from '../../services'
import LocationsService from '../../services/locationsService'

describe('ChangeTemporaryDeactivationDetails', () => {
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const controller = new ChangeTemporaryDeactivationDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
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
      planetFmReference: '123456',
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
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
      services: {
        authService: {
          hmppsAuthClient: {},
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService,
      },
      flash: jest.fn(),
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
    next = jest.fn()

    locationsService.updateTemporaryDeactivation = jest.fn()
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

  describe('compareInitialAndSubmittedValues', () => {
    it('returns a boolean true value if the objects do not match', () => {
      const submittedValues = {
        ...req.form.values,
      }
      submittedValues.estimatedReactivationDate = ''

      expect(
        controller.compareInitialAndSubmittedValues({
          initialValues: req.form.values,
          submittedValues,
        }),
      ).toBe(true)
    })

    it('returns a boolean false value if the objects match', () => {
      const submittedValues = {
        ...req.form.values,
      }

      expect(
        controller.compareInitialAndSubmittedValues({
          initialValues: req.form.values,
          submittedValues,
        }),
      ).toBe(false)
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
          value: 'Description',
        },
        'deactivationReasonDescription-TEST2': {
          ...fields.deactivationReasonDescription,
          id: 'deactivationReasonDescription-TEST2',
          name: 'deactivationReasonDescription-TEST2',
        },
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('calls locationsService.updateTemporaryDeactivation with correct values if values have changed', async () => {
      jest.spyOn(controller, 'getInitialValues').mockReturnValue(formValues)

      await controller.saveValues(req, res, next)

      expect(locationsService.updateTemporaryDeactivation).toHaveBeenCalledWith(
        'token',
        res.locals.location.id,
        'OTHER',
        'Other',
        '2030-04-20',
        '123456',
      )
      expect(next).toHaveBeenCalled()
    })

    it('does not call locationsService.updateTemporaryDeactivation if values have not changed', async () => {
      jest.spyOn(controller, 'getInitialValues').mockReturnValue({
        deactivationReason: 'OTHER',
        deactivationReasonOther: 'Other',
        estimatedReactivationDate: '2030-04-20',
        planetFmReference: '123456',
      })

      await controller.saveValues(req, res, next)

      expect(locationsService.updateTemporaryDeactivation).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('calls next with an error if an error is thrown', async () => {
      const error = new Error('Some error')

      req.services.authService.getSystemClientToken = jest.fn().mockImplementation(() => {
        throw error
      })

      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      res.locals.valuesHaveChanged = true
      controller.successHandler(req, res, next)
    })

    it('resets the journey model', () => {
      expect(req.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(req.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(req.flash).toHaveBeenCalledWith('success', {
        title: 'Deactivation details updated',
        content: `You have updated the deactivation details for this location.`,
      })
    })
  })

  describe('compareInitialAndSubmittedValues', () => {
    it('should convert undefined date values into empty strings', () => {
      const initialValues = req.form.values
      initialValues.estimatedReactivationDate = undefined

      const submittedValues = initialValues
      submittedValues.estimatedReactivationDate = ''

      expect(
        controller.compareInitialAndSubmittedValues({
          initialValues,
          submittedValues,
        }),
      ).toBe(false)
    })
  })
})
