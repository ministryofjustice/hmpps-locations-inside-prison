import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ChangeCellCapacity from './index'
import fields from '../../routes/changeCellCapacity/fields'
import PrisonerFactory from '../../testutils/factories/prisoner'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('ChangeCellCapacity', () => {
  const controller = new ChangeCellCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let permissions: { [permission: string]: boolean }

  beforeEach(() => {
    permissions = { change_max_capacity: true }
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
            maxCapacity: 2,
            workingCapacity: 2,
          },
          prisonId: 'MDI',
          accommodationTypes: ['NORMAL_ACCOMMODATION'],
          specialistCellTypes: [],
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
    it('does not allow zero working capacity for non-specialist cells', () => {
      deepReq.form.values = { maxCapacity: '2', workingCapacity: '0' }
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

    it('does not allow max or working capacity lower than current occupancy', () => {
      deepRes.locals.prisonerLocation.prisoners = [
        PrisonerFactory.build(),
        PrisonerFactory.build(),
        PrisonerFactory.build(),
      ]
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith({
        workingCapacity: {
          args: {},
          key: 'workingCapacity',
          type: 'isNoLessThanOccupancy',
        },
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

  describe('validate', () => {
    it('redirects to the show location page when there are no changes', () => {
      deepReq.form.values = { maxCapacity: '2', workingCapacity: '2' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })

    it('does not redirect to the show location page when the only change is max capacity', () => {
      deepReq.form.values = { maxCapacity: '9', workingCapacity: '2' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).not.toHaveBeenCalled()
    })

    describe('when the user does not have permission to change_max_capacity', () => {
      beforeEach(() => {
        permissions.change_max_capacity = false
      })

      it('redirects to the show location page when the only change is max capacity', () => {
        deepReq.form.values = { maxCapacity: '9', workingCapacity: '2' }
        deepRes.redirect = jest.fn()
        controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        )
      })
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
        backLink: '/referrer-url',
        cancelLink: '/referrer-url',
        fields,
        validationErrors: [
          {
            href: '#workingCapacity',
            text: 'Working capacity cannot be more than 99',
          },
        ],
        insetText:
          'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
        title: 'Change cell capacity',
        titleCaption: 'Cell A-1-001',
      })
    })
  })
})
