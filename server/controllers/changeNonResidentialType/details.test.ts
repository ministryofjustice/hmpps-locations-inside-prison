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
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    req = {
      flash: jest.fn(),
      form: {
        options: {
          fields,
        },
        values: {
          convertedCellType: 'OTHER',
          otherConvertedCellType: 'pet therapy room',
        },
      },
      services: {
        authService,
        locationsService,
      },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: { text: 'Treatment room', value: 'TREATMENT_ROOM' },
              otherConvertedCellType: 'pet therapy room',
            })[fieldName],
        ),
      },
    } as unknown as typeof req
    res = {
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
        options: {
          fields,
        },
        user: {
          username: 'JTIMPSON',
        },
        values: {
          convertedCellType: {
            text: 'Treatment room',
            value: 'TREATMENT_ROOM',
          },
          otherConvertedCellType: 'pet therapy room',
        },
      },
      redirect: jest.fn(),
    } as unknown as typeof res
    next = jest.fn()

    authService.getSystemClientToken = jest.fn().mockResolvedValue('token')
    locationsService.getConvertedCellTypes = jest.fn().mockResolvedValue([
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
    ])
  })

  describe('setOptions', () => {
    beforeEach(async () => {
      await controller.setOptions(req, res, next)
    })

    it('sets the correct radio items', () => {
      expect(req.form.options.fields.convertedCellType.items).toEqual([
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY' },
        { text: 'Office', value: 'OFFICE' },
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
        cancelLink: '/view-and-update-locations/TST/e07effb3-905a-4f6b-acdc-fafbb43a1ee2',
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
                text: 'Kitchen / Servery',
                value: 'KITCHEN_SERVERY',
              },
              {
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
            value: 'TREATMENT_ROOM',
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
    beforeEach(() => {
      req.form.options.fields.convertedCellType.items = [
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY' },
        { text: 'Office', value: 'OFFICE' },
        {
          conditional: 'otherConvertedCellType',
          text: 'Other',
          value: 'OTHER',
        },
      ]
      controller.saveValues(req, res, next)
    })

    it('sets the session model correctly', () => {
      expect(req.sessionModel.set).toHaveBeenCalledWith('convertedCellType', {
        conditional: 'otherConvertedCellType',
        text: 'Other',
        value: 'OTHER',
      })
      expect(req.sessionModel.set).toHaveBeenCalledWith('otherConvertedCellType', 'pet therapy room')
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
