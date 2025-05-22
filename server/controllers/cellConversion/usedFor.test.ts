import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/cellConversion/fields'
import LocationsService from '../../services/locationsService'
import CellConversionUsedFor from './usedFor'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionUsedFor', () => {
  const controller = new CellConversionUsedFor({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
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
    deepReq = {
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
        decoratedLocation: buildDecoratedLocation(),
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
          usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    locationsService.getUsedForTypesForPrison = jest.fn().mockResolvedValue(allUsedForTypes)
  })

  describe('configure', () => {
    it('adds the options to the field', async () => {
      await controller.configure(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(deepReq.form.options.fields.usedForTypes.items).toEqual([
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
      deepRes.locals.errorlist = [
        {
          key: 'usedForTypes',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

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
