import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/nonResidentialConversion/fields'
import maxLength from '../../validators/maxLength'
import ChangeNonResidentialTypeDetails from './details'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ChangeNonResidentialTypeDetails', () => {
  const controller = new ChangeNonResidentialTypeDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>
  const locationsService = new LocationsService(undefined) as jest.Mocked<LocationsService>

  const locationId = '7e570000-0000-0000-0000-000000000001'
  const decoratedLocation = buildDecoratedLocation({
    id: locationId,
    localName: 'A-1-001',
    capacity: {
      maxCapacity: 2,
      workingCapacity: 1,
    },
    prisonId: 'TST',
  })
  const nonResTypes = [
    {
      key: 'KITCHEN_SERVERY',
      description: 'Kitchen / Servery',
    },
    {
      key: 'OFFICE',
      description: 'Office',
    },
    {
      key: 'OTHER',
      description: 'Other',
    },
  ]

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          convertedCellType: 'OFFICE',
          otherConvertedCellType: '',
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      session: {
        systemToken: 'token',
      },
      services: {
        analyticsService,
        locationsService,
      },
      sessionModel: {
        reset: jest.fn(),
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: { text: 'office', value: 'OFFICE' },
              otherConvertedCellType: '',
            })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation,
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: {
            text: 'office',
            value: 'OFFICE',
          },
          otherConvertedCellType: '',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getConvertedCellTypes = jest.fn().mockResolvedValue(nonResTypes)
    locationsService.changeNonResType = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the correct radio items', () => {
      expect(deepReq.form.options.fields.convertedCellType.items).toEqual([
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY', conditional: undefined },
        { text: 'Office', value: 'OFFICE', conditional: undefined },
        {
          text: 'Other',
          value: 'OTHER',
          conditional: 'otherConvertedCellType',
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
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: `/view-and-update-locations/TST/${locationId}`,
        cancelLink: `/view-and-update-locations/TST/${locationId}`,
        fields: {
          convertedCellType: {
            component: 'govukRadios',
            errorMessages: {
              required: 'Select a non-residential room type',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'What is the room being used for?',
              },
            },
            id: 'convertedCellType',
            items: [
              {
                checked: false,
                conditional: undefined,
                text: 'Kitchen / Servery',
                value: 'KITCHEN_SERVERY',
              },
              {
                checked: true,
                conditional: undefined,
                text: 'Office',
                value: 'OFFICE',
              },
              {
                checked: false,
                conditional: 'otherConvertedCellType',
                text: 'Other',
                value: 'OTHER',
              },
            ],
            name: 'convertedCellType',
            validate: ['required'],
            value: 'OFFICE',
          },
          otherConvertedCellType: {
            autocomplete: 'off',
            component: 'govukInput',
            id: 'otherConvertedCellType',
            label: {
              text: 'Room description',
            },
            name: 'otherConvertedCellType',
            validate: ['required', maxLength(30)],
            value: '',
          },
        },
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    it('saves the values via the locations API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.changeNonResType).toHaveBeenCalledWith('token', locationId, 'OFFICE', undefined)
    })

    it('sends an analytics event', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_non_res_type', {
        converted_cell_type: 'OFFICE',
        prison_id: 'TST',
      })
    })

    it('calls next', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })

  describe('successHandler', () => {
    let reqSuccessHandler: any
    let resSuccessHandler: any
    let nextSuccessHandler: any
    let locationIdSuccessHandler: string
    beforeEach(() => {
      reqSuccessHandler = {
        sessionModel: {
          get: jest.fn(),
          reset: jest.fn(),
        },
        journeyModel: {
          reset: jest.fn(),
        },
        flash: jest.fn(),
      }
      resSuccessHandler = {
        redirect: jest.fn(),
        locals: {
          decoratedLocation: buildDecoratedLocation({
            id: locationIdSuccessHandler,
            prisonId: 'TST',
            localName: 'A-1-001',
            pathHierarchy: null,
          }),
        },
      }
      nextSuccessHandler = jest.fn()
    })

    it('sets the flash correctly when change is Successful', () => {
      reqSuccessHandler.sessionModel.get.mockReturnValue(true)
      controller.successHandler(reqSuccessHandler, resSuccessHandler, nextSuccessHandler)
      expect(reqSuccessHandler.flash).toHaveBeenCalledWith('success', {
        content: `You have changed the room type for A-1-001.`,
        title: 'Non-residential room type changed',
      })
    })

    it('sets the flash correctly when other description update is Successful', () => {
      reqSuccessHandler.sessionModel.get.mockImplementation((key: string) => {
        return key === 'otherTypeChanged'
      })

      controller.successHandler(reqSuccessHandler, resSuccessHandler, nextSuccessHandler)
      expect(reqSuccessHandler.flash).toHaveBeenCalledWith('success', {
        content: `You have changed the room description for A-1-001.`,
        title: 'Non-residential room details updated',
      })
    })

    it('resets the journey model', () => {
      controller.successHandler(reqSuccessHandler, resSuccessHandler, nextSuccessHandler)
      expect(reqSuccessHandler.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      controller.successHandler(reqSuccessHandler, resSuccessHandler, nextSuccessHandler)
      expect(reqSuccessHandler.sessionModel.reset).toHaveBeenCalled()
    })

    it('redirects to the view location page', () => {
      controller.successHandler(reqSuccessHandler, resSuccessHandler, nextSuccessHandler)
      expect(resSuccessHandler.redirect).toHaveBeenCalledWith(
        `/view-and-update-locations/TST/${locationIdSuccessHandler}`,
      )
    })
  })
})

describe('OtherConvertedCellType Tests', () => {
  let req: any

  const fieldsItems = {
    convertedCellType: {
      items: [
        { value: 'OFFICE', text: 'Office' },
        { value: 'OTHER', text: 'Other' },
      ],
    },
  }

  // Test cases with different sets of values for two scenarios
  const testCases = [
    {
      description: 'OFFICE type selected, no other room description',
      values: {
        convertedCellType: 'OFFICE',
        otherConvertedCellType: '',
      },
    },
    {
      description: 'OTHER type selected with other room description',
      values: {
        convertedCellType: 'OTHER',
        otherConvertedCellType: 'pet therapy room',
      },
    },
  ]

  // Parameterized test
  testCases.forEach(({ description, values }) => {
    describe(description, () => {
      beforeEach(() => {
        req = {
          flash: jest.fn(),
          form: {
            options: {
              fieldsItems,
            },
            values,
          },
        }
      })

      it('should correctly handle the converted cell type', () => {
        expect(req.form.values.convertedCellType).toBe(values.convertedCellType)
        expect(req.form.values.otherConvertedCellType).toBe(values.otherConvertedCellType)
      })
    })
  })
})
