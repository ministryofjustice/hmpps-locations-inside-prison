import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import fields from '../../../routes/deactivateTemporary/fields'
import { Services } from '../../../services'
import ReactivateCellsConfirm from './confirm'

describe('ReactivateCellsConfirm', () => {
  const controller = new ReactivateCellsConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let sessionModelValues: {
    referrerPrisonId: string
    referrerLocationId: string
    selectedLocations: string[]
  }

  beforeEach(() => {
    sessionModelValues = {
      referrerPrisonId: 'TST',
      referrerLocationId: 'l0',
      selectedLocations: ['l1', 'l2'],
    }
    req = {
      form: {
        options: {
          fields,
        },
        values: sessionModelValues,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: jest.fn((fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName]),
      },
    } as unknown as typeof req
    res = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        location: {
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        },
        cells: [
          {
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          },
        ],
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
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    } as unknown as typeof res
  })

  describe('getResidentialSummary', () => {
    it('calls the correct locations service call', async () => {
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getResidentialSummary: jest.fn(),
        },
      } as unknown as Services
      const callback = jest.fn()
      await controller.getResidentialSummary(req, res, callback)

      expect(req.services.locationsService.getResidentialSummary).toHaveBeenCalledWith(
        'token',
        res.locals.location.prisonId,
      )
    })
  })

  describe('generateChangeSummary', () => {
    it('returns the expected string', () => {
      expect(controller.generateChangeSummary('TEST_NAME', 0, 2)).toEqual(
        `The establishment’s total TEST_NAME capacity will increase from 0 to 2.`,
      )
      expect(controller.generateChangeSummary('TEST_NAME', 2, 0)).toEqual(
        `The establishment’s total TEST_NAME capacity will decrease from 2 to 0.`,
      )
    })
  })

  describe('locals', () => {
    beforeEach(() => {
      req.services = {
        authService: {
          getSystemClientToken: () => 'token',
        },
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      } as unknown as Services
    })

    it('sets the correct locals', async () => {
      expect(controller.locals(req, res)).toEqual({
        backLink: `/reactivate/cells/check-capacity`,
        cancelLink: `/inactive-cells/${sessionModelValues.referrerPrisonId}/${sessionModelValues.referrerLocationId}`,
        changeSummary: `The establishment’s total working capacity will increase from 20 to 22.`,
      })
    })
  })
})
