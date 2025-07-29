import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../services/locationsService'
import CellConversionAccommodationType from './accommodationType'
import fields from '../../routes/cellConversion/fields'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionAccommodationType', () => {
  const controller = new CellConversionAccommodationType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  let sessionModelSave: jest.Mock
  let sessionModelSet: jest.Mock
  let sessionModelUnset: jest.Mock
  let updateSessionData: jest.Mock
  let journeyModelSet: jest.Mock
  let journeyModelGet: jest.Mock
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

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
          accommodationType: 'NORMAL_ACCOMMODATION',
        },
      },
      journeyModel: {
        get: journeyModelGet,
        set: journeyModelSet,
        reset: jest.fn(),
      },
      services: {
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
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
          specialistCellTypes: ['CAT_A'],
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    const allAccommodationTypes = [
      {
        key: 'CARE_AND_SEPARATION',
        description: 'Care and separation',
      },
      {
        key: 'HEALTHCARE_INPATIENTS',
        description: 'Healthcare inpatients',
      },
      {
        key: 'NORMAL_ACCOMMODATION',
        description: 'Normal accommodation',
      },
      {
        key: 'OTHER_NON_RESIDENTIAL',
        description: 'Other',
      },
    ]

    locationsService.getAccommodationTypes = jest.fn().mockResolvedValue(allAccommodationTypes)
  })

  describe('configure', () => {
    it('adds the options to the field', async () => {
      await controller.configure(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(deepReq.form.options.fields.accommodationType.items).toEqual([
        {
          text: 'Care and separation',
          value: 'CARE_AND_SEPARATION',
        },
        {
          text: 'Healthcare inpatients',
          value: 'HEALTHCARE_INPATIENTS',
        },
        {
          text: 'Normal accommodation',
          value: 'NORMAL_ACCOMMODATION',
        },
      ])
    })
  })

  describe('locals', () => {
    beforeEach(() => {
      deepRes.locals.errorlist = [
        {
          key: 'accommodationType',
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
            href: '#accommodationType',
            text: 'Select an accommodation type',
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
              href: '#accommodationType',
              text: 'Select an accommodation type',
            },
          ],
        })
      })

      describe('when the used for types have been set already', () => {
        beforeEach(() => {
          deepReq.sessionModel.get = jest.fn().mockImplementation(key => (key === 'usedForTypes' ? ['HELIPAD'] : null))
        })

        it('makes the next step valid in so that the journey is valid if we click back', () => {
          const newHistory = initialJourneyHistory()
          newHistory[2].invalid = false
          newHistory[2].revalidate = false

          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
        })
      })

      describe('when the used for types have not yet been set', () => {
        beforeEach(() => {
          deepReq.sessionModel.get = jest.fn().mockReturnValue(undefined)
          const history = initialJourneyHistory()
          history[1].next = '/location/44711e6c-7b06-451e-95fe-c454e6957744/cell-conversion/used-for'
          journeyModelGet.mockReturnValue(history)
        })

        it('sets the next step back to /specific-cell-type so that the journey is valid if we click back', () => {
          controller.locals(deepReq as FormWizard.Request, deepRes as Response)
          expect(journeyModelSet).toHaveBeenCalledWith('history', initialJourneyHistory())
        })
      })

      describe('when it is NORMAL_ACCOMMODATION and there is a saved accommodation type', () => {
        describe('when no used for types have been set', () => {
          beforeEach(() => {
            deepReq.sessionModel.get = jest
              .fn()
              .mockImplementation(
                (key: string) =>
                  ({ accommodationType: 'NORMAL_ACCOMMODATION', previousAccommodationType: 'CARE_AND_SEPARATION' })[
                    key
                  ],
              )
          })

          it('directly sets this as the accommodation type in the session', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(updateSessionData).toHaveBeenCalledWith({ accommodationType: 'CARE_AND_SEPARATION' })
            expect(sessionModelSave).toHaveBeenCalled()
          })

          it('updates the locals with the saved accommodation type', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(deepRes.locals.values.accommodationType).toEqual('CARE_AND_SEPARATION')
          })
        })

        describe('when there are used for types but no specialist cell types and working cap is zero', () => {
          beforeEach(() => {
            deepReq.sessionModel.get = jest.fn().mockImplementation(
              (key: string) =>
                ({
                  accommodationType: 'NORMAL_ACCOMMODATION',
                  usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
                  workingCapacity: '0',
                  previousAccommodationType: 'CARE_AND_SEPARATION',
                })[key],
            )
          })

          it('directly sets this as the accommodation type in the session', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(updateSessionData).toHaveBeenCalledWith({ accommodationType: 'CARE_AND_SEPARATION' })
            expect(sessionModelSave).toHaveBeenCalled()
          })

          it('updates the locals with the saved accommodation type', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(deepRes.locals.values.accommodationType).toEqual('CARE_AND_SEPARATION')
          })
        })

        describe('when there are used for types and specialist cell types and working cap is zero', () => {
          beforeEach(() => {
            deepReq.sessionModel.get = jest.fn().mockImplementation(
              (key: string) =>
                ({
                  accommodationType: 'NORMAL_ACCOMMODATION',
                  usedForTypes: ['CLOSE_SUPERVISION_CENTRE'],
                  specialistCellTypes: ['ACCESSIBLE_CELL'],
                  workingCapacity: '0',
                  previousAccommodationType: 'CARE_AND_SEPARATION',
                })[key],
            )
          })

          it('does not directly set this as the accommodation type in the session', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(updateSessionData).not.toHaveBeenCalledWith({ accommodationType: 'CARE_AND_SEPARATION' })
          })

          it('does not update the locals with the saved accommodation type', () => {
            controller.locals(deepReq as FormWizard.Request, deepRes as Response)
            expect(deepRes.locals.values.accommodationType).not.toEqual('CARE_AND_SEPARATION')
          })
        })
      })
    })
  })

  describe('saveValues', () => {
    describe('when edititng', () => {
      beforeEach(() => {
        deepReq.isEditing = true
      })

      describe('when accommodation type is NORMAL_ACCOMMODATION', () => {
        beforeEach(() => {
          deepReq.form.values.accommodationType = 'NORMAL_ACCOMMODATION'
          deepReq.sessionModel.get = jest
            .fn()
            .mockImplementation(key => (key === 'accommodationType' ? 'CARE_AND_SEPARATION' : undefined))

          const history = initialJourneyHistory()
          history[2].invalid = false
          history[2].revalidate = false
          journeyModelGet.mockReturnValue(history)
        })

        it('saves the previous accomodation type', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(sessionModelSet).toHaveBeenCalledWith('previousAccommodationType', 'CARE_AND_SEPARATION')
        })

        it('makes the next step invalid so that it gets shown again', () => {
          const newHistory = initialJourneyHistory()
          newHistory[2].invalid = true
          newHistory[2].revalidate = true

          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(journeyModelSet).toHaveBeenCalledWith('history', newHistory)
        })

        it('calls next', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(next).toHaveBeenCalled()
        })
      })

      describe('when accommodation type is not NORMAL_ACCOMMODATION', () => {
        beforeEach(() => {
          deepReq.form.values.accommodationType = 'CARE_AND_SEPARATION'
        })

        it('unsets the used for types and saved accommodation type in the session', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(sessionModelUnset).toHaveBeenCalledWith('usedForTypes')
          expect(sessionModelUnset).toHaveBeenCalledWith('previousAccommodationType')
        })

        it('calls next', () => {
          controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(next).toHaveBeenCalled()
        })
      })
    })
  })
})
