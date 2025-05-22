import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/cellConversion/fields'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import CellConversionSetCellType from './setCellType'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionSetCellType', () => {
  const controller = new CellConversionSetCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
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
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
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
        decoratedLocation: buildDecoratedLocation({
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
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
    it('returns the expected locals', () => {
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
