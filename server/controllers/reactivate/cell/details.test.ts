import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/reactivate/cell/fields'
import ReactivateCellDetails from './details'
import getReferrerRootUrl from './middleware/getReferrerRootUrl'

describe('ReactivateCellDetails', () => {
  const controller = new ReactivateCellDetails({ route: '/' })
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
            maxCapacity: 4,
            workingCapacity: 2,
          },
          oldWorkingCapacity: 3,
          prisonId: 'TST',
          raw: {
            id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
            capacity: {
              maxCapacity: 4,
              workingCapacity: 2,
            },
            oldWorkingCapacity: 3,
            prisonId: 'TST',
          },
        },
        options: {
          fields,
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

  describe('getInitialValues', () => {
    it('contains the old working capacity', () => {
      expect(controller.getInitialValues(req, res)).toEqual({
        maxCapacity: 4,
        workingCapacity: 3,
      })
    })
  })

  describe('validateFields', () => {
    it('does not allow zero working capacity for non-specialist cells', () => {
      req.form.values = { maxCapacity: '2', workingCapacity: '0' }
      res.locals.location.raw.accommodationTypes = ['NORMAL_ACCOMMODATION']
      res.locals.location.raw.specialistCellTypes = []
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
  })

  describe('locals', () => {
    it('returns the expected locals', () => {
      getReferrerRootUrl(req, res, jest.fn())

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
        cancelLink: `/view-and-update-locations/${res.locals.location.prisonId}/${res.locals.location.id}`,
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
