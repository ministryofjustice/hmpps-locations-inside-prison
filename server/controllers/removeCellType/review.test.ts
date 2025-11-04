import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ReviewCellCapacity from './review'
import fields from '../../routes/changeCellCapacity/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import PrisonerFactory from '../../testutils/factories/prisoner'

describe('ReviewCellCapacity', () => {
  const controller = new ReviewCellCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      form: {
        options: {
          fields,
        },
        values: {
          maxCapacity: '2',
          workingCapacity: '1',
        },
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn(
          (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 0,
          },
          prisonId: 'MDI',
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
        values: {
          maxCapacity: '2',
          workingCapacity: '1',
        },
      },
      redirect: jest.fn(),
    }
  })

  describe('validateFields', () => {
    it('does not allow max or working capacity lower than current occupancy', () => {
      deepRes.locals.prisonerLocation.prisoners = [
        PrisonerFactory.build(),
        PrisonerFactory.build(),
        PrisonerFactory.build(),
      ]
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith({
        maxCapacity: {
          args: {},
          key: 'maxCapacity',
          type: 'isNoLessThanOccupancy',
        },
      })
    })

    it('does not break when current occupancy is undefined', () => {
      deepRes.locals.prisonerLocation = undefined
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith({})
    })
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
        title: 'Review cell capacity',
        titleCaption: 'Cell A-1-001',
        validationErrors: [
          {
            href: '#workingCapacity',
            text: 'Working capacity cannot be more than 99',
          },
        ],
      })
    })
  })
})
