import { NextFunction, Response } from 'express'
import FormWizard from 'hmpo-form-wizard'
import { DeepPartial } from 'fishery'
import NonResidentialConversionDetails from './details'
import LocationsService from '../../services/locationsService'
import fields from '../../routes/nonResidentialConversion/fields'
import maxLength from '../../validators/maxLength'
import buildDecoratedLocation from '../../testutils/buildDecoratedLocation'

describe('NonResidentialConversionDetails', () => {
  const controller = new NonResidentialConversionDetails({ route: '/' })
  let deepReq: DeepPartial<FormWizard.Request>
  let deepRes: DeepPartial<Response>
  let next: NextFunction
  const locationsService = new LocationsService(null) as jest.Mocked<LocationsService>

  beforeEach(() => {
    deepReq = {
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
        locationsService,
      },
      session: { systemToken: 'token' },
      sessionModel: {
        set: jest.fn(),
        get: jest.fn(
          (fieldName?: string) =>
            ({
              convertedCellType: { text: 'Treatment room', value: 'TREATMENT_ROOM' },
              otherConvertedCellType: 'pet therapy room',
            })[fieldName],
        ) as FormWizard.Request['sessionModel']['get'],
      },
    }
    deepRes = {
      locals: {
        errorlist: [],
        decoratedLocation: buildDecoratedLocation({
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
    }
    next = jest.fn()

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
      await controller.setOptions(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the correct radio items', () => {
      expect(deepReq.form.options.fields.convertedCellType.items).toEqual([
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
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('locals', () => {
    it('returns the correct locals', () => {
      expect(controller.locals(deepReq as FormWizard.Request, deepRes as Response)).toEqual({
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
        title: 'Convert to non-residential room',
        titleCaption: 'A-1-001',
        validationErrors: [],
      })
    })
  })

  describe('saveValues', () => {
    beforeEach(() => {
      deepReq.form.options.fields.convertedCellType.items = [
        { text: 'Kitchen / Servery', value: 'KITCHEN_SERVERY' },
        { text: 'Office', value: 'OFFICE' },
        {
          conditional: 'otherConvertedCellType',
          text: 'Other',
          value: 'OTHER',
        },
      ]
      controller.saveValues(deepReq as FormWizard.Request, deepRes as Response, next)
    })

    it('sets the session model correctly', () => {
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('convertedCellType', {
        conditional: 'otherConvertedCellType',
        text: 'Other',
        value: 'OTHER',
      })
      expect(deepReq.sessionModel.set).toHaveBeenCalledWith('otherConvertedCellType', 'pet therapy room')
    })

    it('calls next', () => {
      expect(next).toHaveBeenCalled()
    })
  })
})
