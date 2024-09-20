import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../routes/cellConversion/fields'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import CellConversionUsedFor from './usedFor'

describe('CellConversionUsedFor', () => {
  const controller = new CellConversionUsedFor({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  const allUsedForTypes = [
    {
      key: 'CLOSE_SUPERVISION_CENTRE',
      description: 'Close Supervision Centre (CSC)',
    },
    {
      key: 'SUB_MISUSE_DRUG_RECOVERY',
      description: 'Drug recovery / Incentivised substance free living (ISFL)',
    },
    {
      key: 'FIRST_NIGHT_CENTRE',
      description: 'First night centre / Induction',
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
          usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
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
        location: LocationFactory.build(),
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
          usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getUsedForTypesForPrison = jest.fn().mockResolvedValue(allUsedForTypes)
  })

  describe('configure', () => {
    it('adds the options to the field', async () => {
      await controller.configure(req, res, next)
      expect(req.form.options.fields.usedForTypes.items).toEqual([
        {
          text: 'Close Supervision Centre (CSC)',
          value: 'CLOSE_SUPERVISION_CENTRE',
        },
        {
          text: 'Drug recovery / Incentivised substance free living (ISFL)',
          value: 'SUB_MISUSE_DRUG_RECOVERY',
        },
        {
          text: 'First night centre / Induction',
          value: 'FIRST_NIGHT_CENTRE',
        },
      ])
    })
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      res.locals.errorlist = [
        {
          key: 'usedForTypes',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields,
        validationErrors: [
          {
            href: '#usedForTypes',
            text: 'Select what the location is used for',
          },
        ],
      })
    })
  })
})
