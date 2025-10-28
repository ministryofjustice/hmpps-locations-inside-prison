import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import ReactivateParentConfirm from './confirm'
import fields from '../../../routes/reactivate/parent/fields'
import LocationFactory from '../../../testutils/factories/location'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'

describe('ReactivateParentConfirm', () => {
  const controller = new ReactivateParentConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
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
    deepReq = {
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
        get: jest.fn(
          (fieldName?: keyof typeof sessionModelValues) => sessionModelValues[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        user: { username: 'username' },
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          prisonId: 'TST',
          capacity: {
            maxCapacity: 1,
            workingCapacity: 0,
          },
        }),
        cells: [
          LocationFactory.build({
            id: 'l1',
            oldWorkingCapacity: 2,
            capacity: {
              maxCapacity: 3,
            },
          }),
        ],
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
        values: sessionModelValues,
      },
      redirect: jest.fn(),
    }
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
      deepReq.services = {
        locationsService: {
          getDeactivatedReason: jest.fn(),
        },
      }
    })

    it('sets the correct locals', async () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
        backLink: `/reactivate/parent/${deepRes.locals.decoratedLocation.id}/check-capacity`,
        buttonText: 'Confirm activation',
        cancelLink: `/inactive-cells/${sessionModelValues.referrerPrisonId}/${sessionModelValues.referrerLocationId}`,
        cancelText: 'Cancel',
        changeSummary: `The establishment’s total working capacity will increase from 20 to 22.`,
        title: 'You are about to reactivate 1 cell',
      })
    })
  })
})
