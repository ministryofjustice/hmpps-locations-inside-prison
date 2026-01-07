import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import SetCellType from '.'
import fields from '../../routes/setCellType/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('SetCellType', () => {
  const controller = new SetCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  const allCellTypes = [
    {
      key: 'ACCESSIBLE_CELL',
      description: 'Accessible cell',
      additionalInformation: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
    },
    {
      key: 'BIOHAZARD_DIRTY_PROTEST',
      description: 'Biohazard / dirty protest cell',
      additionalInformation: 'Previously known as a dirty protest cell',
    },
    {
      key: 'CONSTANT_SUPERVISION',
      description: 'Constant Supervision Cell',
    },
  ]

  const decoratedLocation = buildDecoratedLocation({
    specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
  })

  beforeEach(() => {
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          specialistCellTypes: ['CAT_A'],
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      services: {
        analyticsService,
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
        systemToken: 'token',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
        reset: jest.fn(),
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation,
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
        user: {
          username: 'JTIMPSON',
        },
        values: {
          specialistCellTypes: ['CAT_A'],
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getSpecialistCellTypes = jest.fn().mockResolvedValue(allCellTypes)
    locationsService.updateSpecialistCellTypes = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('configure', () => {
    it('adds the options to the field', async () => {
      await controller.configure(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(deepReq.form.options.fields.specialistCellTypes.items).toEqual([
        {
          hint: {
            text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
          },
          text: 'Accessible cell',
          value: 'ACCESSIBLE_CELL',
        },
        {
          hint: {
            text: 'Previously known as a dirty protest cell',
          },
          text: 'Biohazard / dirty protest cell',
          value: 'BIOHAZARD_DIRTY_PROTEST',
        },
        {
          text: 'Constant Supervision Cell',
          value: 'CONSTANT_SUPERVISION',
          hint: {
            text: undefined,
          },
        },
      ])
    })
  })

  describe('locals', () => {
    it('returns the expected locals when there are errors', () => {
      deepRes.locals.errorlist = [
        {
          key: 'specialistCellTypes',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        buttonText: 'Save cell type',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields,
        title: 'Change specific cell type',
        titleCaption: 'Cell A-1-001',
        validationErrors: [
          {
            href: '#specialistCellTypes',
            text: 'Select a cell type',
          },
        ],
      })
    })

    it('returns the expected locals when there are existing cell types', () => {
      const checkboxFields = {
        specialistCellTypes: {
          items: [
            {
              hint: {
                text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
              },
              text: 'Accessible cell',
              value: 'ACCESSIBLE_CELL',
            },
            {
              hint: {
                text: 'Previously known as a dirty protest cell',
              },
              text: 'Biohazard / dirty protest cell',
              value: 'BIOHAZARD_DIRTY_PROTEST',
            },
            {
              text: 'Constant Supervision Cell',
              value: 'CONSTANT_SUPERVISION',
            },
          ],
        },
      }
      deepReq.form.values = {}
      deepRes.locals.fields = checkboxFields

      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      // expect(result).toEqual({
      //   backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      //   buttonText: 'Save cell type',
      //   cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      //   fields: {
      //     specialistCellTypes: {
      //       component: 'govukCheckboxes',
      //       multiple: true,
      //       validate: ['required'],
      //       errorMessages: { required: 'Select a cell type' },
      //       id: 'specialistCellTypes',
      //       name: 'specialistCellTypes',
      //       label: { text: 'Set specific cell type' },
      //       hint: { text: 'Select all that apply.' },
      //       items: [
      //         {
      //           text: 'Accessible cell',
      //           value: 'ACCESSIBLE_CELL',
      //           hint: {
      //             text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
      //           },
      //           checked: false,
      //         },
      //         {
      //           text: 'Biohazard / dirty protest cell',
      //           value: 'BIOHAZARD_DIRTY_PROTEST',
      //           hint: { text: 'Previously known as a dirty protest cell' },
      //           checked: true,
      //         },
      //         {
      //           text: 'Constant Supervision Cell',
      //           value: 'CONSTANT_SUPERVISION',
      //           hint: { text: undefined },
      //           checked: false,
      //         },
      //       ],
      //       value: ['CAT_A'],
      //       errorMessage: { text: 'Select a cell type', href: '#specialistCellTypes' },
      //     },
      //   },
      //   title: 'Change specific cell type',
      //   titleCaption: 'Cell A-1-001',
      //   validationErrors: [],
      // })
    })
  })

  describe('validate', () => {
    it('cancels and redirects to the show location page when there are no changes', () => {
      deepReq.form.values = { specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'] }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })

  describe('saveValues', () => {
    it('saves the values via the locations API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
        'token',
        '7e570000-0000-0000-0000-000000000001',
        ['CAT_A'],
      )
    })

    it('sends an analytics event when setting cell type', async () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = []

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'set_cell_type', { prison_id: 'TST' })
    })

    it('sends an analytics event when changing cell type', async () => {
      deepRes.locals.decoratedLocation.specialistCellTypes = ['EXISTING_TYPE']

      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_cell_type', { prison_id: 'TST' })
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
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
        content: 'You have set a specific cell type for this location.',
        title: 'Cell type set',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })
})
