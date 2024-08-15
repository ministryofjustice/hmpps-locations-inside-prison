import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import NonResidentialConversionConfirm from './confirm'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/nonResidentialConversion/fields'

describe('NonResidentialConversionConfirm', () => {
  const controller = new NonResidentialConversionConfirm({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      form: {
        // @ts-ignore
        options: {},
      },
      journeyModel: {
        reset: jest.fn(),
      },
      // @ts-ignore
      services: {
        authService,
        locationsService,
      },
      // @ts-ignore
      session: {
        referrerUrl: '/',
      },
      // @ts-ignore
      sessionModel: {
        get: jest.fn(
          fieldName =>
            ({
              convertedCellType: { text: 'Treatment room', value: 'TREATMENT_ROOM' },
              otherConvertedCellType: '',
            })[fieldName],
        ),
        reset: jest.fn(),
      },
    }
    res = {
      // @ts-ignore
      locals: {
        errorlist: [],
        location: LocationFactory.build({
          id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
          localName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        residentialSummary: {
          prisonSummary: {
            maxCapacity: 30,
            workingCapacity: 20,
          },
        },
        options: {
          fields,
        },
        // @ts-ignore
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: {
            text: 'Treatment room',
            value: 'TREATMENT_ROOM',
          },
          otherConvertedCellType: '',
        },
      },
      redirect: jest.fn(),
    }
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.convertCellToNonResCell = jest.fn()
  })

  describe('locals', () => {
    it('formats the change summary correctly with non-zero working cap and normal type', () => {
      const result = controller.locals(req, res)
      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: `This will decrease the establishment’s working capacity from 20 to 19.
<br/><br/>
This will decrease the establishment’s maximum capacity from 30 to 28.`,
        convertedCellTypeDetails: 'Treatment room',
      })
    })

    it('formats the change summary correctly with zero working cap and other type', () => {
      req.sessionModel.get = jest.fn(
        fieldName =>
          ({
            convertedCellType: { text: 'Other', value: 'OTHER' },
            otherConvertedCellType: 'Server room',
          })[fieldName],
      )
      res.locals.location = LocationFactory.build({
        id: 'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        capacity: {
          maxCapacity: 2,
          workingCapacity: 0,
        },
        prisonId: 'TST',
      })
      const result = controller.locals(req, res)

      expect(result).toEqual({
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        changeSummary: 'This will decrease the establishment’s maximum capacity from 30 to 28.',
        convertedCellTypeDetails: 'Other - Server room',
      })
    })
  })

  describe('saveValues', () => {
    it('converts the cell to non-residential via the locations API', async () => {
      await controller.saveValues(req, res, next)

      expect(locationsService.convertCellToNonResCell).toHaveBeenCalledWith(
        'token',
        'e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
        'TREATMENT_ROOM',
        undefined,
      )
    })

    it('calls next when successful', async () => {
      await controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('sets the next step to the cell occupied page when cell is occupied error occurs', async () => {
      const error: any = new Error('API error: Cell is occupied')
      error.data = { errorCode: 109 }
      locationsService.convertCellToNonResCell.mockRejectedValue(error)
      await controller.saveValues(req, res, next)

      expect(req.form.options.next).toEqual('occupied')
      expect(next).toHaveBeenCalledWith()
    })

    it('calls next with any unexpected errors', async () => {
      const error = new Error('API error')
      locationsService.convertCellToNonResCell.mockRejectedValue(error)
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
        title: 'Cell converted to non-residential room',
        content: 'You have converted A-1-001 into a non-residential room.',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith('/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2')
    })
  })
})
