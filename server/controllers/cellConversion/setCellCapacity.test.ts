import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import CellConversionSetCellCapacity from './setCellCapacity'
import fields from '../../routes/cellConversion/fields'

describe('CellConversionSetCellCapacity', () => {
  const controller = new CellConversionSetCellCapacity({ route: '/' })
  let req: FormWizard.Request
  let res: DeepPartial<Response>
  let sessionModelSet: jest.Mock
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    sessionModelSet = jest.fn()
    req = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          maxCapacity: 2,
          workingCapacity: 1,
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
        get: jest.fn(),
        set: sessionModelSet,
        unset: jest.fn(),
      },
    } as unknown as FormWizard.Request
    res = {
      locals: {
        errorlist: [],
        location: LocationFactory.build(),
        options: {
          fields,
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
    }
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      res.locals.errorlist = [
        {
          key: 'workingCapacity',
          type: 'lessThanOrEqualTo',
          url: '/',
          args: {
            lessThanOrEqualTo: 99,
          },
        },
      ]
      const result = controller.locals(req, res as Response)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        fields,
        validationErrors: [
          {
            href: '#workingCapacity',
            text: 'Working capacity cannot be more than 99',
          },
        ],
      })
    })
  })

  describe('validateFields', () => {
    describe('when working capacity is zero and it is NORMAL_ACCOMMODATION and has no specialist cell type', () => {
      beforeEach(() => {
        req.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: [] })[key],
          )
        req.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with the expected error', () => {
        const callback = jest.fn()
        controller.validateFields(req, res as Response, callback)

        expect(callback).toHaveBeenCalledWith({
          workingCapacity: {
            args: {},
            key: 'workingCapacity',
            type: 'nonZeroForNormalCell',
          },
        })
      })
    })

    describe('when working capacity is not zero', () => {
      beforeEach(() => {
        req.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: [] })[key],
          )
        req.form.values = { maxCapacity: '3', workingCapacity: '1' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(req, res as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })

    describe('when working capacity is zero and it is NORMAL_ACCOMMODATION and has a specialist cell type', () => {
      beforeEach(() => {
        req.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) =>
              ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: ['ACCESSIBLE_CELL'] })[key],
          )
        req.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(req, res as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })

    describe('when working capacity is zero and it is not NORMAL_ACCOMMODATION', () => {
      beforeEach(() => {
        req.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'CARE_AND_SEPARATION', specialistCellTypes: undefined })[key],
          )
        req.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(req, res as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })
  })
})
