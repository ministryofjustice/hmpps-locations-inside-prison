import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import CellConversionSetCellCapacity from './setCellCapacity'
import fields from '../../routes/cellConversion/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionSetCellCapacity', () => {
  const controller = new CellConversionSetCellCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let sessionModelSet: jest.Mock
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    sessionModelSet = jest.fn()
    deepReq = {
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
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation(),
        options: {
          fields,
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
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      deepRes.locals.errorlist = [
        {
          key: 'workingCapacity',
          type: 'lessThanOrEqualTo',
          url: '/',
          args: {
            lessThanOrEqualTo: 99,
          },
        },
      ]
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        fields,
        validationErrors: [
          {
            href: '#workingCapacity',
            text: 'Working capacity cannot be more than 99',
          },
        ],
        insetText:
          'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
        title: 'Set cell capacity',
        titleCaption: 'Cell A-1-001',
      })
    })
  })

  describe('validateFields', () => {
    describe('when working capacity is zero and it is NORMAL_ACCOMMODATION and has no specialist cell type', () => {
      beforeEach(() => {
        deepReq.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: [] })[key],
          )
        deepReq.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with the expected error', () => {
        const callback = jest.fn()
        controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

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
        deepReq.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: [] })[key],
          )
        deepReq.form.values = { maxCapacity: '3', workingCapacity: '1' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })

    describe('when working capacity is zero and it is NORMAL_ACCOMMODATION and has a specialist cell type', () => {
      beforeEach(() => {
        deepReq.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) =>
              ({ accommodationType: 'NORMAL_ACCOMMODATION', specialistCellTypes: ['ACCESSIBLE_CELL'] })[key],
          )
        deepReq.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })

    describe('when working capacity is zero and it is not NORMAL_ACCOMMODATION', () => {
      beforeEach(() => {
        deepReq.sessionModel.get = jest
          .fn()
          .mockImplementation(
            (key: string) => ({ accommodationType: 'CARE_AND_SEPARATION', specialistCellTypes: undefined })[key],
          )
        deepReq.form.values = { maxCapacity: '3', workingCapacity: '0' }
      })

      it('calls back with no errors', () => {
        const callback = jest.fn()
        controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

        expect(callback).toHaveBeenCalledWith({})
      })
    })
  })
})
