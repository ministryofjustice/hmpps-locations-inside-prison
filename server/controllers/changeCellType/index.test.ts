import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import fields from '../../routes/changeCellType/fields'
import LocationsService from '../../services/locationsService'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'
import ChangeCellType from '.'

describe('SetCellType', () => {
  const controller = new ChangeCellType({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  const allCellTypes = [
    {
      key: 'ACCESSIBLE_CELL',
      description: 'Accessible cell',
      attributes: {
        affectsCapacity: false,
      },
      additionalInformation: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
    },
    {
      key: 'BIOHAZARD_DIRTY_PROTEST',
      description: 'Biohazard cell',
      attributes: {
        affectsCapacity: true,
      },
      additionalInformation: 'Previously known as a dirty protest cell',
    },
    {
      key: 'CSU',
      description: 'Care and separation cell',
      attributes: {
        affectsCapacity: true,
      },
    },
    {
      key: 'CAT_A',
      description: 'Cat A cell',
      attributes: {
        affectsCapacity: false,
      },
    },
  ]

  describe('with normal cell type', () => {
    beforeEach(() => {
      const decoratedLocation = buildDecoratedLocation({
        specialistCellTypes: ['CAT_A'],
      })
      deepReq = {
        flash: jest.fn(),
        form: {
          options: {
            fields,
          },
          values: {
            specialistCellTypes: 'ACCESSIBLE_CELL',
          },
        },
        journeyModel: {
          reset: jest.fn(),
        },
        services: {
          analyticsService,
          locationsService,
        },
        session: {
          referrerUrl: '/referrer-url',
          systemToken: 'token',
        },
        sessionModel: {
          get: jest.fn(
            (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
          ) as FormWizard.Request['sessionModel']['get'],
          reset: jest.fn(),
        },
      }
      deepRes = {
        locals: {
          constants: {
            specialistCellTypes: allCellTypes,
          },
          errorlist: [],
          decoratedLocation,
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
          user: {
            username: 'JTIMPSON',
          },
          values: {
            specialistCellTypes: 'ACCESSIBLE_CELL',
          },
        },
        redirect: jest.fn(),
      }
      next = jest.fn()

      locationsService.getSpecialistCellTypes = jest.fn().mockResolvedValue(allCellTypes)
      locationsService.updateSpecialistCellTypes = jest.fn()
      analyticsService.sendEvent = jest.fn()
    })

    describe('getInitialValues', () => {
      it('returns the current cell type', () => {
        expect(controller.getInitialValues(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
          specialistCellTypes: ['CAT_A'],
        })
      })
    })

    describe('locals', () => {
      it('returns the correct local variables for normal cell type', () => {
        deepRes.locals.options.fields = {
          specialistCellTypes: {
            items: [
              {
                text: 'Accessible cell',
                value: 'ACCESSIBLE_CELL',
                hint: {
                  text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
                },
              },
              {
                text: 'Cat A cell',
                value: 'CAT_A',
                hint: {
                  text: undefined,
                },
              },
            ],
          },
        }
        const locals = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
        expect(locals.title).toBe('Select normal cell type')
        expect(locals.titleCaption).toBe('Cell A-1-001')
        expect(locals.buttonText).toBe('Save cell types')
        expect(deepReq.form.options.fields.specialistCellTypes.component).toBe('govukCheckboxes')
        expect(deepReq.form.options.fields.specialistCellTypes.multiple).toBe(true)
        expect(locals.fields).toEqual({
          specialistCellTypes: {
            items: [
              {
                checked: true,
                hint: {
                  text: 'Also known as wheelchair accessible or Disability and Discrimination Act (DDA) compliant',
                },
                text: 'Accessible cell',
                value: 'ACCESSIBLE_CELL',
              },
              {
                checked: false,
                hint: {
                  text: undefined,
                },
                text: 'Cat A cell',
                value: 'CAT_A',
              },
            ],
            value: 'ACCESSIBLE_CELL',
          },
        })
      })

      it('returns the correct local variables for special cell type', () => {
        deepRes.locals.options.fields = {
          specialistCellTypes: {
            items: [
              {
                text: 'Biohazard cell',
                value: 'BIOHAZARD_DIRTY_PROTEST',
                hint: {
                  text: 'Previously known as a dirty protest cell',
                },
              },
              {
                text: 'Care and separation cell',
                value: 'CSU',
                hint: {
                  text: undefined,
                },
              },
            ],
          },
        }
        deepRes.locals.decoratedLocation.raw.specialistCellTypes = ['BIOHAZARD_DIRTY_PROTEST']
        deepRes.locals.values = {
          specialistCellTypes: ['BIOHAZARD_DIRTY_PROTEST'],
        }
        const locals = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
        expect(locals.title).toBe('Select special cell type')
        expect(locals.titleCaption).toBe('Cell A-1-001')
        expect(locals.buttonText).toBe('Save cell type')
        expect(deepReq.form.options.fields.specialistCellTypes.component).toBe('govukRadios')
        expect(deepReq.form.options.fields.specialistCellTypes.multiple).toBe(false)
        expect(locals.fields).toEqual({
          specialistCellTypes: {
            items: [
              {
                checked: true,
                hint: {
                  text: 'Previously known as a dirty protest cell',
                },
                text: 'Biohazard cell',
                value: 'BIOHAZARD_DIRTY_PROTEST',
              },
              {
                checked: false,
                hint: {
                  text: undefined,
                },
                text: 'Care and separation cell',
                value: 'CSU',
              },
            ],
            value: ['BIOHAZARD_DIRTY_PROTEST'],
          },
        })
      })
    })

    describe('saveValues', () => {
      describe('when normal cell types are chosen', () => {
        beforeEach(() => {
          deepReq.form.values = {
            specialistCellTypes: ['ACCESSIBLE_CELL', 'CAT_A'],
          }
        })

        it('saves the correct types via the locations API', async () => {
          await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
            'token',
            '7e570000-0000-0000-0000-000000000001',
            ['ACCESSIBLE_CELL', 'CAT_A'],
          )
        })
      })

      it('sends an analytics event when setting cell type', async () => {
        deepRes.locals.decoratedLocation.specialistCellTypes = []

        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_cell_type', { prison_id: 'TST' })
      })
    })

    describe('successHandler', () => {
      beforeEach(() => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
      })

      it('resets the journey model', () => {
        expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      })

      it('resets the session model', () => {
        expect(deepReq.sessionModel.reset).toHaveBeenCalled()
      })

      it('sets the flash correctly', () => {
        expect(deepReq.flash).toHaveBeenCalledWith('success', {
          content: 'You have changed the normal cell type for this location.',
          title: 'Cell type changed',
        })
      })

      it('redirects to the view location page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        )
      })
    })
  })

  describe('with special cell type', () => {
    beforeEach(() => {
      const decoratedLocation = buildDecoratedLocation({
        specialistCellTypes: ['CSU'],
      })
      deepReq = {
        flash: jest.fn(),
        form: {
          options: {
            fields,
          },
          values: {
            specialistCellTypes: 'BIOHAZARD_DIRTY_PROTEST',
          },
        },
        journeyModel: {
          reset: jest.fn(),
        },
        services: {
          analyticsService,
          locationsService,
        },
        session: {
          referrerUrl: '/referrer-url',
          systemToken: 'token',
        },
        sessionModel: {
          get: jest.fn(
            (fieldName?: string) => ({ maxCapacity: '3', workingCapacity: '1' })[fieldName],
          ) as FormWizard.Request['sessionModel']['get'],
          reset: jest.fn(),
        },
      }
      deepRes = {
        locals: {
          constants: {
            specialistCellTypes: allCellTypes,
          },
          errorlist: [],
          decoratedLocation,
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
          user: {
            username: 'JTIMPSON',
          },
          values: {
            specialistCellTypes: 'BIOHAZARD_DIRTY_PROTEST',
          },
        },
        redirect: jest.fn(),
      }
      next = jest.fn()

      locationsService.getSpecialistCellTypes = jest.fn().mockResolvedValue(allCellTypes)
      locationsService.updateSpecialistCellTypes = jest.fn()
      analyticsService.sendEvent = jest.fn()
    })

    describe('getInitialValues', () => {
      it('returns the current cell type', () => {
        expect(controller.getInitialValues(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
          specialistCellTypes: ['CSU'],
        })
      })
    })

    describe('locals', () => {
      it('returns the correct local variables', () => {
        const locals = controller.locals(deepReq as FormWizard.Request, deepRes as Response)
        expect(locals.title).toBe('Select special cell type')
        expect(locals.titleCaption).toBe('Cell A-1-001')
      })
    })

    describe('saveValues', () => {
      describe('when a special cell type is chosen', () => {
        beforeEach(() => {
          deepReq.form.values = {
            specialistCellTypes: 'CSU',
          }
        })

        it('saves the correct types via the locations API', async () => {
          await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
          expect(locationsService.updateSpecialistCellTypes).toHaveBeenCalledWith(
            'token',
            '7e570000-0000-0000-0000-000000000001',
            ['CSU'],
          )
        })
      })

      it('sends an analytics event when setting cell type', async () => {
        deepRes.locals.decoratedLocation.specialistCellTypes = []

        await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

        expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'change_cell_type', { prison_id: 'TST' })
      })
    })

    describe('successHandler', () => {
      beforeEach(() => {
        controller.successHandler(deepReq as FormWizard.Request, deepRes as Response, next)
      })

      it('resets the journey model', () => {
        expect(deepReq.journeyModel.reset).toHaveBeenCalled()
      })

      it('resets the session model', () => {
        expect(deepReq.sessionModel.reset).toHaveBeenCalled()
      })

      it('sets the flash correctly', () => {
        expect(deepReq.flash).toHaveBeenCalledWith('success', {
          content: 'You have changed the special cell type for this location.',
          title: 'Special cell type changed',
        })
      })

      it('redirects to the view location page', () => {
        expect(deepRes.redirect).toHaveBeenCalledWith(
          '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
        )
      })
    })
  })
})
