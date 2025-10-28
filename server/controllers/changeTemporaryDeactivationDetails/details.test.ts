import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/deactivate/fields'
import ChangeTemporaryDeactivationDetails from './details'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ChangeTemporaryDeactivationDetails', () => {
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const controller = new ChangeTemporaryDeactivationDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  let formValues: FormWizard.Values

  beforeEach(() => {
    formValues = {
      deactivationReason: 'OTHER',
      deactivationReasonDescription: 'Description',
      deactivationReasonOther: 'Other',
      estimatedReactivationDate: '2030-04-20',
      planetFmReference: '123456',
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
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: keyof typeof formValues) => formValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
      journeyModel: {
        reset: jest.fn(),
      },
      services: {
        analyticsService,
        locationsService,
      },
      flash: jest.fn(),
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
          locationType: 'CELL',
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
    next = jest.fn()

    locationsService.updateTemporaryDeactivation = jest.fn()
    analyticsService.sendEvent = jest.fn()
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
        backLink: '/referrer-url',
        buttonText: 'Update deactivation details',
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
  })

  describe('compareInitialAndSubmittedValues', () => {
    it('returns a boolean true value if the objects do not match', () => {
      const submittedValues = {
        ...deepReq.form.values,
      }
      submittedValues.estimatedReactivationDate = ''

      expect(
        controller.compareInitialAndSubmittedValues({
          initialValues: deepReq.form.values,
          submittedValues,
        }),
      ).toBe(true)
    })

    it('returns a boolean false value if the objects match', () => {
      const submittedValues = {
        ...deepReq.form.values,
      }

      expect(
        controller.compareInitialAndSubmittedValues({
          initialValues: deepReq.form.values,
          submittedValues,
        }),
      ).toBe(false)
    })
  })

  describe('validate', () => {
    it('cancels and redirects to the show location page when there are no changes', () => {
      jest.spyOn(controller, 'getInitialValues').mockReturnValue({
        deactivationReason: 'OTHER',
        deactivationReasonOther: 'Other',
        estimatedReactivationDate: '2030-04-20',
        planetFmReference: '123456',
      })

      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('calls locationsService.updateTemporaryDeactivation with correct values if values have changed', async () => {
      jest.spyOn(controller, 'getInitialValues').mockReturnValue(formValues)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.updateTemporaryDeactivation).toHaveBeenCalledWith(
        'token',
        deepRes.locals.decoratedLocation.id,
        'OTHER',
        'Other',
        '2030-04-20',
        '123456',
      )
      expect(next).toHaveBeenCalled()
    })

    it('sends an analytics event', async () => {
      jest.spyOn(controller, 'getInitialValues').mockReturnValue(formValues)

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_temp_deactivation', {
        prison_id: 'TST',
        deactivation_reason: 'OTHER',
        location_type: 'Cell',
      })
    })

    it('calls next with an error if an error is thrown', async () => {
      const error = new Error('Some error')

      deepReq.services.locationsService.updateTemporaryDeactivation = jest.fn().mockImplementation(() => {
        throw error
      })

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      deepRes.locals.valuesHaveChanged = true
      controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('resets the journey model', () => {
      expect(deepReq.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(deepReq.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(deepReq.flash).toHaveBeenCalledWith('success', {
        title: 'Deactivation details updated',
        content: `You have updated the deactivation details for this location.`,
      })
    })
  })

  describe('compareInitialAndSubmittedValues', () => {
    it('should convert undefined date values into empty strings', () => {
      const initialValues = deepReq.form.values
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
