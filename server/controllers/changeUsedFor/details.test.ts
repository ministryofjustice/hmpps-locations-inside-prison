import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ChangeUsedForDetails from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/changeUsedFor/fields'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ChangeUsedForDetails', () => {
  const controller = new ChangeUsedForDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      session: {
        referrerUrl: '',
        systemToken: 'token',
      },
      form: {
        options: {
          fields,
        },
        values: {
          usedFor: ['STANDARD_ACCOMMODATION', 'TEST_TYPE'],
        },
      },
      services: {
        analyticsService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              usedFor: [{ text: 'Remand', value: 'REMAND' }],
            })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          localName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          usedFor: [
            {
              value: 'REMAND',
              text: 'Remand',
            },
          ],
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getUsedForTypes = jest.fn().mockResolvedValue([
      { key: 'REMAND', description: 'Remand' },
      { key: 'THERAPEUTIC_COMMUNITY', description: 'Therapeutic community' },
    ])
    locationsService.updateUsedForTypes = jest.fn().mockResolvedValue(true)
    analyticsService.sendEvent = jest.fn()
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the correct checkbox items', () => {
      expect(deepReq.form.options.fields.usedFor.items).toEqual([
        {
          value: 'REMAND',
          text: 'Remand',
        },
        {
          value: 'THERAPEUTIC_COMMUNITY',
          text: 'Therapeutic community',
        },
      ])
    })

    it('calls next', () => {
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      controller.setOptions(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        buttonText: 'Save used for',
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        fields: {
          usedFor: {
            component: 'govukCheckboxes',
            errorMessages: {
              required: 'Select what the location is used for',
            },
            hint: { text: 'Select all that apply.' },
            id: 'usedFor',
            items: [
              {
                value: 'REMAND',
                text: 'Remand',
              },
              {
                value: 'THERAPEUTIC_COMMUNITY',
                text: 'Therapeutic community',
              },
            ],
            multiple: true,
            name: 'usedFor',
            validate: ['required'],
            value: [
              {
                text: 'Remand',
                value: 'REMAND',
              },
            ],
          },
        },
        leafLevel: false,
        title: 'Change what the location is used for',
        titleCaption: 'A-1-001',
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.options.fields.usedFor.items = [
        {
          value: 'REMAND',
          text: 'Remand',
        },
      ]
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('calls locationsService', () => {
      expect(locationsService.updateUsedForTypes).toHaveBeenCalledWith(
        'token',
        deepRes.locals.decoratedLocation.id,
        deepReq.form.values.usedFor,
      )
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_used_for', { prison_id: 'TST' })
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
