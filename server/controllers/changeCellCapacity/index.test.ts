import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ChangeCellCapacity from './index'
import fields from '../../routes/changeCellCapacity/fields'
import PrisonerFactory from '../../testutils/factories/prisoner'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import mockModel from '../../testutils/mockModel'

describe('ChangeCellCapacity', () => {
  const controller = new ChangeCellCapacity({ route: '/' })
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
      sessionModel: mockModel({ maxCapacity: '3', workingCapacity: '1' }),
    }
    deepRes = {
      locals: {
        constants: {
          specialistCellTypes: [
            {
              key: 'BIOHAZARD_DIRTY_PROTEST',
              description: 'Biohazard / dirty protest cell',
              attributes: { affectsCapacity: true },
            },
            { key: 'ACCESSIBLE_CELL', description: 'Accessible cell', attributes: { affectsCapacity: false } },
          ],
        },
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
        prisonConfiguration: {
          certificationApprovalRequired: 'ACTIVE',
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
    it('does not allow zero working capacity for normal accommodation cells', () => {
      deepReq.form.values = { maxCapacity: '2', workingCapacity: '0' }
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          workingCapacity: {
            args: {},
            key: 'workingCapacity',
            type: 'nonZeroForNormalCell',
          },
        }),
      )
    })

    it('allows zero working capacity for special accommodation cells', () => {
      deepRes.locals.decoratedLocation = buildDecoratedLocation({
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: { maxCapacity: 2, workingCapacity: 2 },
        prisonId: 'MDI',
        accommodationTypes: ['BIOHAZARD_DIRTY_PROTEST'],
        specialistCellTypes: ['ACCESSIBLE_CELL'],
      })
      deepReq.form.values = { maxCapacity: '2', workingCapacity: '0' }
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).not.toHaveBeenCalledWith({
        workingCapacity: {
          args: {},
          key: 'workingCapacity',
          type: 'nonZeroForNormalCell',
        },
      })
    })

    it('does not allow working capacity lower than current occupancy for normal accommodation cells', () => {
      deepRes.locals.prisonerLocation.prisoners = [
        PrisonerFactory.build(),
        PrisonerFactory.build(),
        PrisonerFactory.build(),
      ]
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          workingCapacity: {
            args: {},
            key: 'workingCapacity',
            type: 'isNoLessThanOccupancy',
          },
        }),
      )
    })

    it('allows working capacity lower than occupancy for specialist cells', () => {
      deepRes.locals.decoratedLocation = buildDecoratedLocation({
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: { maxCapacity: 2, workingCapacity: 2 },
        prisonId: 'MDI',
        accommodationTypes: ['NORMAL_ACCOMMODATION'],
        specialistCellTypes: ['ACCESSIBLE_CELL'],
      })
      deepRes.locals.prisonerLocation.prisoners = [
        PrisonerFactory.build(),
        PrisonerFactory.build(),
        PrisonerFactory.build(),
      ]
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          workingCapacity: {
            args: {},
            key: 'workingCapacity',
            type: 'isNoLessThanOccupancy',
          },
        }),
      )
    })

    it('does not allow max capacity lower than current occupancy', () => {
      deepRes.locals.prisonerLocation.prisoners = [
        PrisonerFactory.build(),
        PrisonerFactory.build(),
        PrisonerFactory.build(),
      ]
      const callback = jest.fn()
      controller.validateFields(deepReq as FormWizard.Request, deepRes as Response, callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          maxCapacity: {
            args: {},
            key: 'maxCapacity',
            type: 'isNoLessThanOccupancy',
          },
        }),
      )
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
      deepReq.form.values = { baselineCna: '2', maxCapacity: '2', workingCapacity: '2' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
      )
    })

    it('does not redirect to the show location page when the only change is max capacity', () => {
      deepReq.form.values = { baselineCna: '2', maxCapacity: '9', workingCapacity: '2' }
      deepRes.redirect = jest.fn()
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepRes.redirect).not.toHaveBeenCalled()
    })

    it('sets onlyWorkingCapChanged flag to false when max capacity changes', () => {
      deepReq.form.values = { baselineCna: '2', maxCapacity: '9', workingCapacity: '2' }
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('onlyWorkingCapChanged', false)
    })

    it('sets onlyWorkingCapChanged flag to true when only working capacity changes', () => {
      deepReq.form.values = { baselineCna: '2', maxCapacity: '2', workingCapacity: '1' }
      controller.validate(deepReq as FormWizard.Request, deepRes as Response, jest.fn())

      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('onlyWorkingCapChanged', true)
    })
  })

  describe('locals', () => {
    it('returns the expected locals when cert is active', () => {
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
          'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a baseline certified normal accommodation and working capacity of 0.',
      })
    })

    it('returns inset text without CNA when cert is not active', () => {
      deepRes.locals.prisonConfiguration = { certificationApprovalRequired: 'INACTIVE' }
      deepRes.locals.errorlist = []
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.insetText).toEqual(
        'Cells used for someone to stay in temporarily (such as care and separation, healthcare or special accommodation cells) should have a working capacity of 0.',
      )
    })
  })
})
