import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import SetCellType from '.'
import fields from '../../routes/setCellType/fields'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import AnalyticsService from '../../services/analyticsService'

describe('SetCellType', () => {
  const controller = new SetCellType({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
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

  const location = LocationFactory.build({
    specialistCellTypes: ['Biohazard / dirty protest cell'],
  })
  location.raw = {
    ...location,
    specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
  }

  beforeEach(() => {
    req = {
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
        authService,
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
        reset: jest.fn(),
      },
    } as unknown as typeof req
    res = {
      locals: {
        errorlist: [],
        location,
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
        user: {
          username: 'JTIMPSON',
        },
        values: {
          specialistCellTypes: ['CAT_A'],
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getSpecialistCellTypes = jest.fn().mockResolvedValue(allCellTypes)
    locationsService.updateSpecialistCellTypes = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('configure', () => {
    it('adds the options to the field', async () => {
      await controller.configure(req, res, next)
      expect(req.form.options.fields.specialistCellTypes.items).toEqual([
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
      res.locals.errorlist = [
        {
          key: 'specialistCellTypes',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields,
        pageTitleText: 'Change specific cell type',
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
      req.form.values = {}
      res.locals.fields = checkboxFields

      const result = controller.locals(req, res)

      expect(result).toEqual({
        backLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields: {
          specialistCellTypes: {
            component: 'govukCheckboxes',
            multiple: true,
            validate: ['required'],
            errorMessages: { required: 'Select a cell type' },
            id: 'specialistCellTypes',
            name: 'specialistCellTypes',
            label: { text: 'Set specific cell type' },
            hint: { text: 'Select all that apply.' },
            items: [
              {
                text: 'Accessible cell',
                value: 'ACCESSIBLE_CELL',
                hint: {
                  text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
                },
                checked: false,
              },
              {
                text: 'Biohazard / dirty protest cell',
                value: 'BIOHAZARD_DIRTY_PROTEST',
                hint: { text: 'Previously known as a dirty protest cell' },
                checked: true,
              },
              {
                text: 'Constant Supervision Cell',
                value: 'CONSTANT_SUPERVISION',
                hint: { text: undefined },
                checked: false,
              },
            ],
            value: ['CAT_A'],
            errorMessage: { text: 'Select a cell type', href: '#specialistCellTypes' },
          },
        },
        pageTitleText: 'Change specific cell type',
        validationErrors: [],
      })
    })
  })

  describe('validate', () => {
    it('cancels and redirects to the show location page when there are no changes', () => {
      req.form.values = { specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'] }
      res.redirect = jest.fn()
      controller.validate(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001')
    })
  })

  describe('saveValues', () => {
    it('saves the values via the locations API', async () => {
      await controller.saveValues(req, res, next)
      expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
        'token',
        '7e570000-0000-0000-0000-000000000001',
        ['CAT_A'],
      )
    })

    it('sends an analytics event when setting cell type', async () => {
      res.locals.location.specialistCellTypes = []

      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'set_cell_type', { prison_id: 'TST' })
    })

    it('sends an analytics event when changing cell type', async () => {
      res.locals.location.specialistCellTypes = ['EXISTING_TYPE']

      await controller.saveValues(req, res, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(req, 'change_cell_type', { prison_id: 'TST' })
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
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
        content: 'You have set a specific cell type for this location.',
        title: 'Cell type set',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001')
    })
  })
})
