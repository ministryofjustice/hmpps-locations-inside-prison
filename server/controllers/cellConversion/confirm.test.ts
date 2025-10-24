import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import LocationsService from '../../services/locationsService'
import CellConversionConfirm from './confirm'
import fields from '../../routes/cellConversion/fields'
import AnalyticsService from '../../services/analyticsService'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('CellConversionConfirm', () => {
  const controller = new CellConversionConfirm({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  let sessionModelGet: jest.Mock
  let sessionModelSet: jest.Mock
  let sessionModelUnset: jest.Mock
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
  const analyticsService = new AnalyticsService(null) as jest.Mocked<AnalyticsService>

  const formValues: any = {
    accommodationType: 'NORMAL_ACCOMMODATION',
    maxCapacity: 2,
    specialistCellTypes: ['ACCESSIBLE_CELL', 'CSU'],
    usedForTypes: ['CLOSE_SUPERVISION_CENTRE', 'FIRST_NIGHT_CENTRE'],
    workingCapacity: 1,
  }

  beforeEach(() => {
    sessionModelSet = jest.fn()
    sessionModelGet = jest.fn().mockImplementation(key => formValues[key])
    sessionModelUnset = jest.fn()
    deepReq = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
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
        get: sessionModelGet,
        set: sessionModelSet,
        reset: jest.fn(),
        unset: sessionModelUnset,
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({ localName: 'Executive washroom' }),
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
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    const allAccommodationTypes: any = {
      CARE_AND_SEPARATION: 'Care and separation',
      HEALTHCARE_INPATIENTS: 'Healthcare inpatients',
      NORMAL_ACCOMMODATION: 'Normal accommodation',
    }

    const allSpecialistCellTypes: any = {
      ACCESSIBLE_CELL: 'Accessible cell',
      BIOHAZARD_DIRTY_PROTEST: 'Biohazard / dirty protest cell',
      CSU: 'Care and separation cell',
    }

    const allUsedForTypes: any = {
      CLOSE_SUPERVISION_CENTRE: 'Close Supervision Centre (CSC)',
      SUB_MISUSE_DRUG_RECOVERY: 'Drug recovery / Incentivised substance free living (ISFL)',
      FIRST_NIGHT_CENTRE: 'First night centre / Induction',
    }

    locationsService.getAccommodationType = jest.fn().mockImplementation((_, key) => allAccommodationTypes[key])
    locationsService.getSpecialistCellType = jest.fn().mockImplementation((_, key) => allSpecialistCellTypes[key])
    locationsService.getUsedForType = jest.fn().mockImplementation((_, key) => allUsedForTypes[key])
    locationsService.convertToCell = jest.fn()
    analyticsService.sendEvent = jest.fn()
  })

  describe('get', () => {
    it('adds the human-readable type names to the locals', async () => {
      await controller.get(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(deepRes.locals.accommodationType).toEqual('Normal accommodation')
      expect(deepRes.locals.maxCapacity).toEqual(2)
      expect(deepRes.locals.specialistCellTypes).toEqual(['Accessible cell', 'Care and separation cell'])
      expect(deepRes.locals.usedForTypes).toEqual(['Close Supervision Centre (CSC)', 'First night centre / Induction'])
      expect(deepRes.locals.workingCapacity).toEqual(1)
    })
  })

  describe('locals', () => {
    beforeEach(() => {
      deepRes.locals.accommodationType = 'Normal accommodation'
      deepRes.locals.maxCapacity = '2'
      deepRes.locals.specialistCellTypes = ['Accessible cell', 'Care and separation cell']
      deepRes.locals.usedForTypes = ['Close Supervision Centre (CSC)', 'First night centre / Induction']
      deepRes.locals.workingCapacity = '1'
    })

    it('returns the expected locals', () => {
      const result = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result).toEqual({
        buttonText: 'Confirm conversion',
        changeSummary:
          'This will increase the establishment’s working capacity from 20 to 21.\n<br/><br/>\nThis will increase the establishment’s maximum capacity from 30 to 32.',
        summaryListRows: [
          {
            key: { text: 'Accommodation type' },
            value: { text: 'Normal accommodation' },
            actions: {
              items: [
                {
                  href: '/location/7e570000-0000-0000-0000-000000000001/cell-conversion/accommodation-type/edit',
                  text: 'Change',
                  classes: 'govuk-link--no-visited-state',
                },
              ],
            },
          },
          {
            key: { text: 'Used for' },
            value: { html: 'Close Supervision Centre (CSC)<br>First night centre / Induction' },
            actions: {
              items: [
                {
                  href: '/location/7e570000-0000-0000-0000-000000000001/cell-conversion/used-for/edit',
                  text: 'Change',
                  classes: 'govuk-link--no-visited-state',
                },
              ],
            },
          },
          {
            key: { text: 'Cell type' },
            value: { html: 'Accessible cell<br>Care and separation cell' },
            actions: {
              items: [
                {
                  href: '/location/7e570000-0000-0000-0000-000000000001/cell-conversion/specific-cell-type/edit',
                  text: 'Change',
                  classes: 'govuk-link--no-visited-state',
                },
              ],
            },
          },
          {
            key: { text: 'Working capacity' },
            value: { text: '1' },
            actions: {
              items: [
                {
                  href: '/location/7e570000-0000-0000-0000-000000000001/cell-conversion/set-cell-capacity/edit',
                  text: 'Change',
                  classes: 'govuk-link--no-visited-state',
                },
              ],
            },
          },
          {
            key: { text: 'Maximum capacity' },
            value: { text: '2' },
            actions: {
              items: [
                {
                  href: '/location/7e570000-0000-0000-0000-000000000001/cell-conversion/set-cell-capacity/edit',
                  text: 'Change',
                  classes: 'govuk-link--no-visited-state',
                },
              ],
            },
          },
        ],
        title: 'Confirm conversion to cell',
        titleCaption: 'Executive washroom',
      })
    })

    it('returns the correct summary when working cap is zero', () => {
      deepRes.locals.maxCapacity = '2'
      deepRes.locals.workingCapacity = '0'
      const result: any = controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(result.changeSummary).toEqual('This will increase the establishment’s maximum capacity from 30 to 32.')
    })

    it('clears any saved values from the edit journeys', () => {
      controller.locals(deepReq as FormWizard.Request, deepRes as Response)

      expect(sessionModelUnset).toHaveBeenCalledWith('previousCellTypes')
      expect(sessionModelUnset).toHaveBeenCalledWith('previousAccommodationType')
    })
  })

  describe('saveValues', () => {
    it('converts the location to a cell via the locations API', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(locationsService.convertToCell).toHaveBeenCalledWith(
        'token',
        '7e570000-0000-0000-0000-000000000001',
        'NORMAL_ACCOMMODATION',
        ['ACCESSIBLE_CELL', 'CSU'],
        2,
        1,
        ['CLOSE_SUPERVISION_CENTRE', 'FIRST_NIGHT_CENTRE'],
      )
    })

    it('calls next when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })

    it('sends an analytics event when successful', async () => {
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(analyticsService.sendEvent).toHaveBeenCalledWith(deepReq, 'convert_to_cell', {
        prison_id: 'TST',
        accommodation_type: 'NORMAL_ACCOMMODATION',
      })
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      ;(locationsService.convertToCell as jest.Mock).mockRejectedValue(error)
      await controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)

      expect(next).toHaveBeenCalledWith(error)
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
        title: 'Non-residential room converted to a cell',
        content: 'You have converted Executive washroom into a cell.',
      })
    })

    it('redirects to the view location page', () => {
      expect(deepRes.redirect).toHaveBeenCalledWith(
        '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
      )
    })
  })
})
