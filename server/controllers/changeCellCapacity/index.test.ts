import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import ChangeCellCapacity from './index'
import fields from '../../routes/changeCellCapacity/fields'

describe('ChangeCellCapacity', () => {
  const controller = new ChangeCellCapacity({ route: '/' })
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {
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
        get: jest.fn((fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
          prisonId: 'MDI',
        },
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
        values: {
          maxCapacity: '2',
          workingCapacity: '1',
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('validateFields', () => {
    it('does not allow zero working capacity for non-specialist cells', () => {
      req.form.values = { maxCapacity: '2', workingCapacity: '0' }
      res.locals.location.accommodationTypes = ['NORMAL_ACCOMMODATION']
      res.locals.location.specialistCellTypes = []
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({
        workingCapacity: {
          args: {},
          key: 'workingCapacity',
          type: 'nonZeroForNormalCell',
        },
      })
    })

    it('does not allow max or working capacity lower than current occupancy', () => {
      res.locals.prisonerLocation.prisoners = [{}, {}, {}]
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

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
      res.locals.prisonerLocation = undefined
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({})
    })
  })

  describe('validate', () => {
    it('redirects to the show location page when there are no changes', () => {
      req.form.values = { maxCapacity: '2', workingCapacity: '2' }
      res.redirect = jest.fn()
      controller.validate(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/MDI/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
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
      const result = controller.locals(req, res)

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
      })
    })
  })
})
