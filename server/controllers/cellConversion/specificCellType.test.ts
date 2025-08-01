import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import CellConversionSpecificCellType from './specificCellType'
import fields from '../../routes/cellConversion/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionSpecificCellType', () => {
  const controller = new CellConversionSpecificCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  let sessionModelSave: jest.Mock
  let sessionModelSet: jest.Mock
  let sessionModelUnset: jest.Mock
  let updateSessionData: jest.Mock
  let journeyModelSet: jest.Mock
  let journeyModelGet: jest.Mock

  const initialJourneyHistory = () => [
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/accommodation-type',
      wizard: 'cell-conversion',
      skip: true,
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/accommodation-type',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/specific-cell-type',
      fields: ['accommodationType'],
      formFields: ['accommodationType'],
      wizard: 'cell-conversion',
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/used-for',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/specific-cell-type',
      fields: ['usedForTypes'],
      formFields: ['usedForTypes'],
      wizard: 'cell-conversion',
      revalidate: true,
      invalid: true,
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/specific-cell-type',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-type',
      fields: ['hasSpecificCellType'],
      formFields: ['hasSpecificCellType'],
      wizard: 'cell-conversion',
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-type',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity',
      fields: ['specialistCellTypes'],
      formFields: ['specialistCellTypes'],
      wizard: 'cell-conversion',
    },
    {
      path: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity',
      next: '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/confirm',
      fields: ['workingCapacity', 'maxCapacity'],
      formFields: ['workingCapacity', 'maxCapacity'],
      wizard: 'cell-conversion',
    },
  ]

  beforeEach(() => {
    sessionModelSave = jest.fn()
    sessionModelSet = jest.fn()
    sessionModelUnset = jest.fn()
    updateSessionData = jest.fn()
    journeyModelSet = jest.fn()
    journeyModelGet = jest.fn().mockReturnValue(initialJourneyHistory())
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          hasSpecificCellType: 'yes',
        },
      },
      journeyModel: {
        get: journeyModelGet,
        set: journeyModelSet,
        reset: jest.fn(),
      },
      sessionModel: {
        get: jest.fn(),
        save: sessionModelSave,
        set: sessionModelSet,
        unset: sessionModelUnset,
        updateSessionData,
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation(),
        options: {
          fields,
        },
        prisonResidentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          hasSpecificCellType: 'yes',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()
  })

  describe('locals', () => {
    beforeEach(() => {
      deepRes.locals.errorlist = [
        {
          key: 'hasSpecificCellType',
          type: 'required',
          url: '/',
          args: {},
        },
      ]
    })

    it('returns the expected locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        fields,
        validationErrors: [
          {
            href: '#hasSpecificCellType',
            text: 'Select yes if it is a specific type of cell',
          },
        ],
      })
    })

    describe('when edititng', () => {
      beforeEach(() => {
        deepReq.isEditing = true
      })

      it('returns the expected locals', () => {
        const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

        expect(result).toEqual({
          fields,
          validationErrors: [
            {
              href: '#hasSpecificCellType',
              text: 'Select yes if it is a specific type of cell',
            },
          ],
        })
      })

      describe('when the specialist cell types have been set already', () => {
        beforeEach(() => {
          deepReq.sessionModel.get = jest
            .fn()
            .mockImplementation(key => (key === 'specialistCellTypes' ? ['CAT_A'] : null))
        })

        it('makes the next step valid in so that the journey is valid if we click back', () => {
          const newHistory = initialJourneyHistory()
          newHistory[4].invalid = false
          newHistory[4].revalidate = false

          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
        })
      })

      describe('when the specialist cell types have not yet been set', () => {
        beforeEach(() => {
          deepReq.sessionModel.get = jest.fn().mockReturnValue(undefined)
        })

        it('sets the next step back to /set-cell-capacity so that the journey is valid if we click back', () => {
          const newJourneyHistory = initialJourneyHistory()
          newJourneyHistory[3].next = '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity'
          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newJourneyHistory)
        })

        it('sets the answer back to no in the session', () => {
          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(sessionModelSet).toHaveBeenCalledWith('hasSpecificCellType', 'no', { silent: true })
        })

        it('sets the answer as no in the locals', () => {
          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(deepRes.locals.values.hasSpecificCellType).toEqual('no')
        })
      })

      describe('when the cell capacity has been set already', () => {
        beforeEach(() => {
          deepReq.sessionModel.get = jest
            .fn()
            .mockImplementation((key: string) => ({ maxCapacity: '2', workingCapacity: '1' })[key])
        })

        it('makes the set capacity step valid in so that the journey is valid if we click back', () => {
          const newHistory = initialJourneyHistory()
          newHistory[3].next = '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/set-cell-capacity'
          newHistory[5].invalid = false
          newHistory[5].revalidate = false

          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
        })
      })
    })
  })

  describe('saveValues', () => {
    describe('when edititng', () => {
      beforeEach(() => {
        deepReq.isEditing = true
      })

      describe('when the answer is yes', () => {
        beforeEach(() => {
          deepReq.form.values.hasSpecificCellType = 'yes'
        })

        it('clears the saved cell types', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(sessionModelUnset).toHaveBeenCalledWith('previousCellTypes')
        })

        it('makes the next step invalid so that it gets shown again', () => {
          const newHistory = initialJourneyHistory()
          newHistory[4].invalid = true
          newHistory[4].revalidate = true

          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
        })

        it('calls next', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(next).toHaveBeenCalled()
        })
      })

      describe('when the answer is no', () => {
        beforeEach(() => {
          deepReq.form.values.hasSpecificCellType = 'no'
        })

        it('unsets the specialist cell types', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(sessionModelUnset).toHaveBeenCalledWith('specialistCellTypes')
        })

        it('clears the saved cell types', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(sessionModelUnset).toHaveBeenCalledWith('previousCellTypes')
        })

        it('calls next', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(next).toHaveBeenCalled()
        })

        describe('when the working capacity is zero and is NORMAL_ACCOMMODATION', () => {
          beforeEach(() => {
            deepReq.sessionModel.get = jest.fn().mockImplementation(
              (key: string) =>
                ({
                  maxCapacity: '2',
                  workingCapacity: '0',
                  accommodationType: 'NORMAL_ACCOMMODATION',
                  specialistCellTypes: ['ACCESSIBLE_CELL'],
                })[key],
            )
          })

          it('invalidates the set capacity step in so that it gets shown again', () => {
            const newHistory = initialJourneyHistory()
            newHistory[5].invalid = true
            newHistory[5].revalidate = true

            controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
            expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
          })

          it('saves the cell types in case we need to restore them', () => {
            controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
            expect(sessionModelSet).toHaveBeenCalledWith('previousCellTypes', ['ACCESSIBLE_CELL'])
          })
        })

        describe('when the working capacity is zero and is not NORMAL_ACCOMMODATION', () => {
          beforeEach(() => {
            deepReq.sessionModel.get = jest
              .fn()
              .mockImplementation(
                (key: string) =>
                  ({ maxCapacity: '2', workingCapacity: '0', accommodationType: 'CARE_AND_SEPARATION' })[key],
              )
          })

          it('does not invalidate the set capacity step', () => {
            const newHistory = initialJourneyHistory()
            newHistory[5].invalid = true
            newHistory[5].revalidate = true

            controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
            expect(journeyModelSet).not.toHaveBeenCalledWith('history', newHistory)
          })
        })
      })
    })
  })
})
