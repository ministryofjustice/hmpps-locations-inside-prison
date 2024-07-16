import { Response } from 'express'
import ChangeCellCapacity from './index'
import fields from '../../routes/changeCellCapacity/fields'

describe('ChangeCellCapacity', () => {
  const controller = new ChangeCellCapacity({ route: '/' })
  // @ts-ignore
  let req: FormWizard.Request
  let res: Response

  beforeEach(() => {
    req = {
      form: {
        options: {
          fields
        },
        values: {
          maxCapacity: '2',
          workingCapacity: '1',
        }
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        // @ts-ignore
        get: jest.fn(fieldName => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName]),
      },
    }
    res = {
      // @ts-ignore
      locals: {
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 2,
          },
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
    }
  })

  describe('validateFields', () => {
    it('does not allow working capacity to exceed max capacity', () => {
      req.form.values = { maxCapacity: '2', workingCapacity: '3' }
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({
        workingCapacity: {
          args: {},
          key: 'workingCapacity',
          type: 'doesNotExceedMaxCap',
        }
      })
    })

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
        }
      })
    })

    it('does not allow max capacity lower than current occupancy', () => {
      res.locals.prisonerLocation.prisoners = [{}, {}, {}]
      const callback = jest.fn()
      controller.validateFields(req, res, callback)

      expect(callback).toHaveBeenCalledWith({
        maxCapacity: {
          args: {},
          key: 'maxCapacity',
          type: 'isNoLessThanOccupancy',
        }
      })
    })
  })

  describe('validate', () => {
    it('redirects to the show location page when there are no changes', () => {
      req.form.values = { maxCapacity: '2', workingCapacity: '2' }
      res.redirect = jest.fn()
      controller.validate(req, res, jest.fn())

      expect(res.redirect).toHaveBeenCalledWith(
        '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/cancel'
      )
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
        cancelLink: '/location/e07effb3-905a-4f6b-acdc-fafbb43a1ee2/change-cell-capacity/cancel',
        fields,
        validationErrors: [
          {
            href: '#workingCapacity',
            text: 'Working capacity cannot be more than 99',
          }
        ],
      })
    })
  })
})
