import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/reactivate/cell/fields'
import ReactivateCellDetails from './details'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('ReactivateCellDetails', () => {
  const controller = new ReactivateCellDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  let permissions: { [permission: string]: boolean }

  beforeEach(() => {
    permissions = {}
    deepReq = {
      canAccess: (permission: string) => permissions[permission],
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
        systemToken: 'token',
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
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 4,
            workingCapacity: 2,
          },
          oldWorkingCapacity: 3,
          prisonId: 'TST',
        }),
        options: {
          fields,
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

  describe('getInitialValues', () => {
    it('contains the old working capacity', () => {
      expect(controller.getInitialValues(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        maxCapacity: 4,
        workingCapacity: 3,
      })
    })
  })

  describe('validateFields', () => {
    it('does not allow zero working capacity for normal accommodation cells', () => {
      deepReq.form.values = { maxCapacity: '2', workingCapacity: '0' }
      deepRes.locals.decoratedLocation.raw.accommodationTypes = ['NORMAL_ACCOMMODATION']
      deepRes.locals.decoratedLocation.raw.specialistCellTypes = []
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

  describe('locals', () => {
    it('returns the expected locals', () => {
      getReferrerRootUrl(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

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
        backLink: '/referrer-url',
        cancelLink: `/view-and-update-locations/${deepRes.locals.decoratedLocation.prisonId}/${deepRes.locals.decoratedLocation.id}`,
        fields,
        insetText:
          'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
        title: 'Check cell capacity',
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
