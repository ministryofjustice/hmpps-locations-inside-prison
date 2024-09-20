import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../routes/cellConversion/fields'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import CellConversionSetCellType from './setCellType'

describe('CellConversionSetCellType', () => {
  const controller = new CellConversionSetCellType({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

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
        location: LocationFactory.build({
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
        }),
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
    it('returns the expected locals', () => {
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
        buttonText: 'Continue',
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields,
        validationErrors: [
          {
            href: '#specialistCellTypes',
            text: 'Select a cell type',
          },
        ],
      })
    })
  })
})
