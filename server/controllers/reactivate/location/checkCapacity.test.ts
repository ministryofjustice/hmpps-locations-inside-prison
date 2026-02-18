import { Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../../routes/reactivate/cell/fields'
import buildDecoratedLocation from '../../../testutils/buildDecoratedLocation'
import CheckCapacity from './checkCapacity'

describe('CheckCapacity', () => {
  const controller = new CheckCapacity({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>

  beforeEach(() => {
    deepReq = {
      form: {
        options: {
          fields,
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
          leafLevel: true,
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

  describe('locals', () => {
    describe('for a cell', () => {
      it('returns the expected locals', () => {
        const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

        expect(result).toEqual({
          fields,
          title: 'Check capacity of cell',
          titleCaption: 'Cell A-1-001',
          minLayout: 'three-quarters',
          validationErrors: [],
        })
      })
    })

    describe('for a landing', () => {
      beforeEach(() => {
        deepRes.locals.decoratedLocation = buildDecoratedLocation({
          locationType: 'LANDING',
          key: 'TST-A-1',
          pathHierarchy: 'A-1',
          leafLevel: false,
        })
      })

      it('returns the expected locals', () => {
        const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

        expect(result).toEqual({
          fields,
          title: 'Check capacity of cells',
          titleCaption: 'Landing A-1',
          minLayout: 'three-quarters',
          validationErrors: [],
        })
      })
    })
  })
})
