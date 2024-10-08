import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import AuthService from '../../services/authService'
import LocationsService from '../../services/locationsService'
import LocationFactory from '../../testutils/factories/location'
import fields from '../../routes/nonResidentialConversion/fields'
import maxLength from '../../validators/maxLength'
import ChangeNonResidentialTypeDetails from './details'

describe('ChangeNonResidentialTypeDetails', () => {
  const controller = new ChangeNonResidentialTypeDetails({ route: '/' })
  let req: FormWizard.Request
  let res: Response
  let next: NextFunction
  const authService = new AuthService(null) as jest.Mocked<AuthService>
  const locationsService = new LocationsService(undefined) as jest.Mocked<LocationsService>

  const locationId = '7e570000-0000-0000-0000-000000000001'
  const nonResTypes = [
    {
      key: 'KITCHEN_SERVERY',
      description: 'Kitchen / Servery',
    },
    {
      key: 'OFFICE',
      description: 'Office',
    },
    {
      key: 'OTHER',
      description: 'Other',
    },
  ]

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          convertedCellType: 'OFFICE',
          otherConvertedCellType: 'pet therapy room',
        },
      },
      journeyModel: {
        reset: jest.fn(),
      },
      services: {
        authService,
        locationsService,
      },
      sessionModel: {
        reset: jest.fn(),
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: { text: 'office', value: 'OFFICE' },
              otherConvertedCellType: 'pet therapy room',
            })[fieldName],
        ),
      },
    } as unknown as typeof req
    res = {
      services: {
        authService: {
          getSystemClientToken: jest.fn().mockResolvedValue('token'),
        },
        locationsService: {
          changeNonResType: jest.fn().mockResolvedValue(undefined), // Mocked locations service
        },
      },
      form: {
        options: {
          fields: {
            convertedCellType: {
              items: [
                { text: 'office', value: 'OFFICE' }, // Matching value to be found
                { text: 'pet therapy room', value: 'PET_THERAPY' },
              ],
            },
          },
        },
        values: {
          convertedCellType: 'OFFICE', // Mock the form value correctly
          otherConvertedCellType: 'pet therapy room',
        },
      },

      locals: {
        errorlist: [],
        location: LocationFactory.build({
          id: locationId,
          localName: 'A-1-001',
          capacity: {
            maxCapacity: 2,
            workingCapacity: 1,
          },
          prisonId: 'TST',
        }),
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: {
            text: 'office',
            value: 'OFFICE',
          },
          otherConvertedCellType: 'pet therapy room',
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getConvertedCellTypes = jest.fn().mockResolvedValue(nonResTypes)
    locationsService.changeNonResType = jest.fn()
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(req, res, next)
    })

    it('sets the correct radio items', () => {
      expect(req.form.options.fields.convertedCellType.items).toEqual([
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY', conditional: undefined },
        { text: 'Office', value: 'OFFICE', conditional: undefined },
        {
          text: 'Other',
          value: 'OTHER',
          conditional: 'otherConvertedCellType',
        },
      ])
    })

    it('calls next', () => {
      controller.saveValues(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(req, res)).toEqual({
        backLink: `/view-and-update-locations/TST/${locationId}`,
        cancelLink: `/view-and-update-locations/TST/${locationId}`,
        fields: {
          convertedCellType: {
            component: 'govukRadios',
            errorMessages: {
              required: 'Select a non-residential room type',
            },
            fieldset: {
              legend: {
                classes: 'govuk-fieldset__legend--m',
                text: 'What is the room being used for?',
              },
            },
            id: 'convertedCellType',
            items: [
              {
                conditional: undefined,
                text: 'Kitchen / Servery',
                value: 'KITCHEN_SERVERY',
              },
              {
                conditional: undefined,
                text: 'Office',
                value: 'OFFICE',
              },
              {
                conditional: 'otherConvertedCellType',
                text: 'Other',
                value: 'OTHER',
              },
            ],
            name: 'convertedCellType',
            validate: ['required'],
            value: 'OFFICE',
          },
          otherConvertedCellType: {
            autocomplete: 'off',
            component: 'govukInput',
            id: 'otherConvertedCellType',
            label: {
              text: 'Room description',
            },
            name: 'otherConvertedCellType',
            validate: ['required', maxLength(30)],
            value: 'pet therapy room',
          },
        },
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    it('saves the values via the locations API', async () => {
      await controller.saveValues(req, res, next)
      expect(locationsService.changeNonResType).toHaveBeenCalledWith('token', locationId, 'OFFICE', undefined)
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
        content: `You have changed the room type for A-1-001.`,
        title: 'Non-residential room type changed',
      })
    })

    it('redirects to the view location page', () => {
      expect(res.redirect).toHaveBeenCalledWith(`/view-and-update-locations/TST/${locationId}`)
    })
  })
})
