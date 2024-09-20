import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import CellConversionConfirm from './confirm'
import fields from '../../routes/cellConversion/fields'

describe('CellConversionConfirm', () => {
  const controller = new CellConversionConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  let sessionModelGet: jest.Mock
  let sessionModelSet: jest.Mock
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>
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
    req = {
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
        authService,
        locationsService,
      },
      session: {
        referrerUrl: '/referrer-url',
      },
      sessionModel: {
        get: sessionModelGet,
        set: sessionModelSet,
        reset: jest.fn(),
      },
    } as unknown as FormWizard.Request
    res = {
      locals: {
        errorlist: [],
        location: LocationFactory.build({ localName: 'Executive washroom' }),
        options: {
          fields,
        },
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        // @ts-ignore
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

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getAccommodationType = jest.fn().mockImplementation((_, key) => allAccommodationTypes[key])
    locationsService.getSpecialistCellType = jest.fn().mockImplementation((_, key) => allSpecialistCellTypes[key])
    locationsService.getUsedForType = jest.fn().mockImplementation((_, key) => allUsedForTypes[key])
    locationsService.convertToCell = jest.fn()
  })

  describe('get', () => {
    it('adds the human-readable type names to the locals', async () => {
      await controller.get(req, res, next)
      expect(res.locals.accommodationType).toEqual('Normal accommodation')
      expect(res.locals.maxCapacity).toEqual(2)
      expect(res.locals.specialistCellTypes).toEqual(['Accessible cell', 'Care and separation cell'])
      expect(res.locals.usedForTypes).toEqual(['Close Supervision Centre (CSC)', 'First night centre / Induction'])
      expect(res.locals.workingCapacity).toEqual(1)
    })
  })

  describe('locals', () => {
    beforeEach(() => {
      res.locals.accommodationType = 'Normal accommodation'
      res.locals.maxCapacity = '2'
      res.locals.specialistCellTypes = ['Accessible cell', 'Care and separation cell']
      res.locals.usedForTypes = ['Close Supervision Centre (CSC)', 'First night centre / Induction']
      res.locals.workingCapacity = '1'
    })

    it('returns the expected locals', () => {
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001',
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
      })
    })

    it('returns the correct summary when working cap is zero', () => {
      res.locals.maxCapacity = '2'
      res.locals.workingCapacity = '0'
      const result: any = controller.locals(req, res)

      expect(result.changeSummary).toEqual('This will increase the establishment’s maximum capacity from 30 to 32.')
    })
  })

  describe('saveValues', () => {
    it('converts the location to a cell via the locations API', async () => {
      await controller.saveValues(req, res, next)

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
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      ;(locationsService.convertToCell as jest.Mock).mockRejectedValue(error)
      await controller.saveValues(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('successHandler', () => {
    beforeEach(() => {
      controller.successHandler(req, res, next)
    })

    it('resets the journey model', () => {
      expect(req.journeyModel.reset).toHaveBeenCalled()
    })

    it('resets the session model', () => {
      expect(req.sessionModel.reset).toHaveBeenCalled()
    })

    it('sets the flash correctly', () => {
      expect(req.flash).toHaveBeenCalledWith('success', {
        title: 'Non-residential room converted to a cell',
        content: 'You have converted Executive washroom into a cell.',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/7e570000-0000-0000-0000-000000000001')
    })
  })
})
